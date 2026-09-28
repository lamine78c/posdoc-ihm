import { Component, Input, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { CreateUpdateNoticeQuery } from '@app/models/payload/create-update-notice';
import { SiteDataInterface } from '@app/models/supervision/production/details/notices-interface';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, PORNOT_CODE, ZERO } from '@app/shared/utils/Constants';
import ConvertorUtil from '@app/shared/utils/convertorUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { TableauNoticeService } from '../service/tableau-notice.service';

@Component({
  selector: 'app-tableau-notice',
  templateUrl: './tableau-notice.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class TableauNoticeComponent implements OnInit {
  @Input()
  isNoticesActives: boolean;

  CODSIT_FIELD = 'codsit';
  addType: number;
  canAddPermPosition: number;
  canEditPermPosition: number;
  canRemovePermPosition: number = AUTH.FICHIER_EDITION.NOTICES.NOTICES_ACTIVES.supprimer;
  canUploadFilePerm: number = AUTH.FICHIER_EDITION.NOTICES.NOTICES_ACTIVES.uploader;

  gridApi: GridApi;
  gridOptions: GridOptions;
  columnDefs: ColDef[];
  overlayNoRowsTemplate: string;
  noticesData = [];
  totalNotices = ZERO;
  subscriptions: Subscription[] = [];

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  siteData$: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(
    private readonly notesService: NotesService,
    private readonly apiNoticeService: ApiNoticesService,
    private readonly tableauNoticeService: TableauNoticeService,
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService
  ) {}

  ngOnInit(): void {
    const permission = this.isNoticesActives ? this.getNoticesActivesPermissions() : this.getNoticesPerimeesPermissions();

    this.addType = this.isNoticesActives ? AddType.INLINE_ROW : ZERO;

    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.columnDefs = this.tableauNoticeService.getColumnDefs(permission, this.isNoticesActives);
    this.overlayNoRowsTemplate = this.tableauNoticeService.getOverlayNoRowsTemplate();

    this.columnDefs.find(col => col.field === this.CODSIT_FIELD).cellRendererParams.selectData = this.siteData$;

    this.subscribeToNoticeUpdates();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    this.searchNotices();
  }

  searchNotices() {
    const request = this.isNoticesActives ? this.apiNoticeService.getActiveNotices() : this.apiNoticeService.getExpiredNotices();

    this.subscriptions.push(
      request.pipe(take(1)).subscribe((result: any) => {
        const data = result.data;
        this.noticesData = this.isNoticesActives ? data.allActiveNotices : data.allExpiredNotices;

        this.noticesData = this.noticesData.map(notice => {
          notice.pornot = ConvertorUtil.convertPornotCodeToLabel(notice.pornot);
          // pour l'onglet notices périmées, on mets la colonne activer en false
          if (!this.isNoticesActives) {
            notice.perime = 0;
          }
          return notice;
        });

        this.totalNotices = this.noticesData.length;
        this.setSiteOptions(data);
      })
    );
  }

  setSiteOptions(data: SiteDataInterface | null): void {
    const sites = data?.allSitesCNP;

    const formattedSites = Array.isArray(sites)
      ? sites.map(({ code }) => ({ value: code, text: code })).sort((a, b) => a.text.localeCompare(b.text))
      : [];

    this.siteData$.next(formattedSites);
  }

  onDeleteRow(event: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    const codnot = event[ZERO]?.codnot;
    this.subscriptions.push(
      this.apiNoticeService.deleteNotice(codnot).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.notesService.show({
            title: `La notice ${codnot} a été supprimée avec succès`,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.totalNotices = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
          SharedUtil.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  isRowDataValid(notice) {
    return (
      notice.pornot && ((notice.pornot === PORNOT_CODE.Nationale && !notice.codsit) || (notice.pornot !== PORNOT_CODE.Nationale && notice.codsit))
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    if ([...editedRow].length === ZERO) {
      return;
    }
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const isNewRow: boolean = [...editedRow][ZERO][ONE].newRow;
    const notice = this.getCreateUpdateNoticeQuery(editedRow, isNewRow);
    notice.pornot = ConvertorUtil.convertPornotLabelToCode(notice.pornot);
    if (!this.isRowDataValid(notice)) {
      return;
    }
    if (isNewRow) {
      this.subscriptions.push(
        this.apiNoticeService.createNotice(notice).subscribe({
          next: () => {
            this.createNoticeSuccess(errors);
          },
          error: error => {
            this.handleRequestError(error, errors);
          },
        })
      );
    } else {
      this.subscriptions.push(
        this.apiNoticeService.updateNotice(notice).subscribe({
          next: () => {
            this.updateNoticeSuccess(notice, errors);
          },
          error: error => {
            this.handleRequestError(error, errors);
          },
        })
      );
    }
  }

  createNoticeSuccess(errors: Map<number, TableAsynchronousError[]>) {
    this.notesService.show({
      title: 'La notice a été créée avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    this.gridApi.forEachNode(node => Object.prototype.hasOwnProperty.call(node.data, 'newRow') && delete node.data.newRow);

    this.asynchronousErrors$.next(errors);
    this.totalNotices = SharedUtil.getNumberTotalRows(this.gridApi);
  }

  updateNoticeSuccess(notice: CreateUpdateNoticeQuery, errors: Map<number, TableAsynchronousError[]>) {
    this.notesService.show({
      title: `La notice ${notice.codnot} a été modifiée avec succès`,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    this.asynchronousErrors$.next(errors);
    this.searchNotices();
  }

  handleRequestError(error: any, errors: Map<number, TableAsynchronousError[]>) {
    const err: TableAsynchronousError = {
      isError: true,
      message: error.graphQLErrors[ZERO].message,
      id: null,
    };
    SharedUtil.setError(ONE, err, errors);
    this.asynchronousErrors$.next(errors);
  }

  getCreateUpdateNoticeQuery(editedRow: Map<number, any>, isNewRow: boolean): CreateUpdateNoticeQuery {
    const notice = [...editedRow][ZERO][ONE];
    const perime = this.isNoticesActives ? +notice.perime : +!notice.perime;
    return {
      codnot: notice.codnot,
      libnot: notice.libnot,
      fornot: notice.fornot,
      poinot: notice.poinot,
      pornot: notice.pornot,
      dnotir: notice.dnotir,
      perime: isNewRow ? +!this.isNoticesActives : perime,
      codsit: notice.codsit,
    };
  }

  private getNoticesActivesPermissions(): any {
    return this.setPermissions(AUTH.FICHIER_EDITION.NOTICES.NOTICES_ACTIVES);
  }

  private getNoticesPerimeesPermissions(): any {
    return this.setPermissions(AUTH.FICHIER_EDITION.NOTICES.NOTICES_PERIMEES);
  }

  private setPermissions(permission: any): any {
    this.canAddPermPosition = permission.ajouter;
    this.canEditPermPosition = permission.modifier;
    this.canRemovePermPosition = permission.supprimer;
    this.canUploadFilePerm = permission.uploader;

    return permission;
  }

  subscribeToNoticeUpdates() {
    this.subscriptions.push(
      this.tableauNoticeService.getNoticesUpdatedListener().subscribe(notices => {
        this.noticesData = notices.map(notice => {
          notice.pornot = ConvertorUtil.convertPornotCodeToLabel(notice.pornot);
          // pour l'onglet notices périmées, on mets la colonne activer en false
          if (!this.isNoticesActives) {
            notice.perime = 0;
          }
          return notice;
        });
      })
    );
  }
}
