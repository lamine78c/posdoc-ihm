import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AddType } from '@app/models/enums/add-type';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { getFormName, ONE, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { ModalAjoutComponent } from './modal/modal-ajout/modal-ajout.component';
import { SearchNoticesByCriteres } from './model/search-notices-by-criteres';
import { NotficIdInterface, NotficInterface, NotficNodeDataInterface } from '@app/models/gestion-fichier-edition/notices/notfic';
import { ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { AffectationNoticeServiceAggregator } from '@app/produit/notice/service/affectation-notice.service';
import { TableauComponent } from '@app/fullstack-components/tableau/components/tableau/tableau.component';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PermissionService } from '@app/services/permission/permission.service';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';

@Component({
  selector: 'app-affectation-notice',
  templateUrl: './affectation-notice.component.html',
  styleUrls: ['./affectation-notice.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class AffectationNoticeComponent implements OnInit {
  @ViewChild(TableauComponent) tableauComponent!: TableauComponent;

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  rowData: NotficNodeDataInterface[] = [];
  addType = AddType.MODAL;
  totalNotices = ZERO;
  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  formName = getFormName();
  form: FormGroup;
  hasEditPerm: boolean;
  selectedNotice: string;
  disableAddBtn = true;
  newStartDate: string = null;
  newEndDate: string = null;
  endDateMinDate: NgbDateStruct;
  notificToUpdate: NotficInterface[] = [];
  isSomeChangeNotSubmited = false;
  subscriptions: Subscription[] = [];
  modifiedRows: Set<string> = new Set();

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiNoticesService: ApiNoticesService,
    private readonly services: AffectationNoticeServiceAggregator
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initGridOptions();
    this.columnDefs = this.services.tableauAffectationNoticeService.getColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.services.tableauAffectationNoticeService.getOverlayNoRowsTemplate();
    this.hasEditPerm = this.servicePerm.hasPermission(this.auth[KEY_MODIFIER_AUTH]);
    // Observateur se lance lorsqu'une notice est choisie et change l'état btn ajouter
    this.subscriptions.push(
      this.services.dataService.getTransferedData().subscribe(data => {
        if (data?.selectedNotice !== undefined) {
          this.disableAddBtn = !!!data.selectedNotice;
          this.selectedNotice = data.selectedNotice;
        }
      })
    );
    this.initMinEndDate();
    this.updateModificationState();
  }

  initForm() {
    this.form = this.fb.group({
      dateDeb: [''],
      dateFin: [''],
    });
  }

  initGridOptions() {
    this.gridOptions = {
      ...this.services.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll),
      getRowClass: params => {
        const uniqueKey = `${params.data.codenv}-${params.data.codorg}-${params.data.codapp}-${params.data.codcom}-${params.data.codfic}`;
        return this.modifiedRows.has(uniqueKey) ? 'modified-row' : '';
      },
    };
  }

  initMinEndDate() {
    this.subscriptions.push(
      this.form.get('dateDeb').valueChanges.subscribe(value => {
        const dateFinControl = this.form.get('dateFin');
        const dateFinValue = dateFinControl.value;
        const newDateDeb = new Date(value?.year, value?.month - ONE, value?.day);
        const newDateFin = new Date(dateFinValue?.year, dateFinValue?.month - ONE, dateFinValue?.day);
        this.endDateMinDate = value;
        if (!value || (dateFinValue && newDateDeb > newDateFin)) {
          dateFinControl.setValue('');
          this.endDateMinDate = null;
        }
      })
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.gridApi.setGridOption('loading', false);
  }

  openAddPopup() {
    if (this.isSomeChangeNotSubmited) {
      this.services.changeNotSubmitedConfirmationService.askConfirmation().subscribe(confirmed => {
        if (confirmed) {
          this.affectationNoticePopup();
          this.resetChanges();
        }
      });
    } else {
      this.affectationNoticePopup();
    }
  }

  private affectationNoticePopup() {
    if (!!this.selectedNotice) {
      const modalAjoutComplet = this.services.modalService.open(ModalAjoutComponent, { windowClass: 'modal-affectation-notice', backdrop: 'static' });
      modalAjoutComplet.componentInstance.title = 'Affectation des fichiers à la notice ' + this.selectedNotice;
      modalAjoutComplet.componentInstance.selectedNotice = this.selectedNotice;
      this.subscriptions.push(
        modalAjoutComplet.componentInstance.passEntry.subscribe(() => {
          this.relanceSearch();
        })
      );
    }
  }

  relanceSearch() {
    this.services.dataService.setDataToTransfer({
      relanceSearchAffNot: true,
    });
  }

  lister(event) {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    this.subscriptions.push(
      this.apiNoticesService
        .findNotficByParam(this.getQuerySearchFromEvent(event))
        .pipe(take(1))
        .subscribe(response => {
          this.rowData = response.data.findNotficByParam.map(e => {
            e.codenv_codorg_codapp = e.codenv + '-' + e.codorg + '-' + e.codapp;
            e.codcom_codfic = e.codcom + '-' + e.codfic;
            e.codnot = event.notice;
            return e;
          });
          this.totalNotices = response.data.findNotficByParam.length;
          if (!this.totalNotices) {
            this.services.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          }
          this.resetChanges();
          this.tableauComponent.ngOnInit();
        })
    );
  }

  getQuerySearchFromEvent(event) {
    this.selectedNotice = event.notice;
    const query = new SearchNoticesByCriteres();
    query.codnot = event.notice;
    query.codenv = event[this.formName.ENVIRONNEMENT];
    query.codorg = event[this.formName.ORGANISME];
    query.codapp = event[this.formName.APPLICATION];
    query.codcom = event[this.formName.COMMANDE];
    query.codfic = event[this.formName.FICHIER];
    query.refimp = event[this.formName.REFIMPRIME];
    return query;
  }

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiNoticesService.deleteAffectationNotices(this.getNoficId(event)).subscribe(
        () => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.showSuccessMessage(event);
          this.totalNotices = SharedUtil.getNumberTotalRows(this.gridApi);
          this.resetChanges();
          this.updateModificationState();
        },
        error => {
          this.showErrorMessage(error, errors);
        }
      )
    );
  }

  updateModificationState(): void {
    this.services.tableauModifiableService.setIsSomeChangeNotSubmited(this.isSomeChangeNotSubmited);
  }

  getNoficId(event): NotficIdInterface[] {
    return event.map(e => {
      return {
        codenv: e.codenv,
        codorg: e.codorg,
        codapp: e.codapp,
        codcom: e.codcom,
        codfic: e.codfic,
        codnot: this.selectedNotice,
      };
    });
  }

  updateDates() {
    this.setNewDates();
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      const hasExistingDate = node.data.dnotid !== null || node.data.dnotit !== null;
      const hasNewDate = this.newStartDate !== null || this.newEndDate !== null;

      if (hasExistingDate || hasNewDate) {
        node.setDataValue('dnotid', this.newStartDate);
        node.setDataValue('dnotit', this.newEndDate);
        this.notficToUpdate(node.data);

        const uniqueKey = `${node.data.codenv}-${node.data.codorg}-${node.data.codapp}-${node.data.codcom}-${node.data.codfic}`;
        this.modifiedRows.add(uniqueKey);
      }
    });

    if (this.notificToUpdate.length > ZERO) {
      this.isSomeChangeNotSubmited = true;
      this.updateModificationState();
    }

    this.gridApi.refreshCells({ force: true });
    this.gridApi.redrawRows();
    this.gridApi.deselectAll();
  }

  notficToUpdate(nodeData: NotficNodeDataInterface): void {
    const codnot = this.selectedNotice;
    const existingNotfic = this.findExistingNotfic(nodeData, codnot);

    if (existingNotfic) {
      this.updateNotficDates(existingNotfic);
    } else {
      const newNotfic = this.createNotfic(nodeData, codnot);
      this.notificToUpdate.push(newNotfic);
    }
  }

  private isSameNotification(notfic: NotficInterface, nodeData: NotficNodeDataInterface, codnot: string): boolean {
    return (
      notfic.codenv === nodeData.codenv &&
      notfic.codorg === nodeData.codorg &&
      notfic.codapp === nodeData.codapp &&
      notfic.codcom === nodeData.codcom &&
      notfic.codfic === nodeData.codfic &&
      notfic.codnot === codnot
    );
  }

  private findExistingNotfic(nodeData: NotficNodeDataInterface, codnot: string): NotficInterface | undefined {
    return this.notificToUpdate.find(notfic => this.isSameNotification(notfic, nodeData, codnot));
  }

  private updateNotficDates(notfic: NotficInterface): void {
    if (this.newStartDate) {
      notfic.dnotid = this.newStartDate;
    }
    if (this.newEndDate) {
      notfic.dnotit = this.newEndDate;
    }
  }

  private createNotfic(node: any, codnot: string): NotficInterface {
    return {
      codenv: node.codenv,
      codorg: node.codorg,
      codapp: node.codapp,
      codcom: node.codcom,
      codfic: node.codfic,
      codnot,
      dnotid: this.newStartDate,
      dnotit: this.newEndDate,
      maxnot: node.maxnot,
    };
  }

  private setNewDates() {
    const data = this.form.getRawValue();
    this.newStartDate = data.dateDeb
      ? this.services.datePipe.transform(data.dateDeb['year'] + '-' + data.dateDeb['month'] + '-' + data.dateDeb['day'], 'yyyy-MM-dd')
      : null;

    this.newEndDate = data.dateFin
      ? this.services.datePipe.transform(data.dateFin['year'] + '-' + data.dateFin['month'] + '-' + data.dateFin['day'], 'yyyy-MM-dd')
      : null;
  }

  updateAffectationNotices() {
    this.subscriptions.push(
      this.apiNoticesService.updateNofics(this.notificToUpdate).subscribe(
        (response: any) => {
          this.resetChanges();
          this.updateModificationState();
          this.services.noteService.show({
            title: `Les dates des ${response.data.updateNotfics.length} notices ont été mises à jour avec succès`,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error => {
          this.showErrorMessage(error, new Map());
        }
      )
    );
  }

  resetChanges() {
    this.form.reset();
    this.notificToUpdate = [];
    this.isSomeChangeNotSubmited = false;
    this.modifiedRows.clear();
    this.gridApi.refreshCells({ force: true });
    this.gridApi.redrawRows();
  }

  isApplyButtonDisabled(): boolean {
    const nodeSelected = this.gridApi?.getSelectedNodes().length > ZERO;
    return !nodeSelected;
  }

  isValidateButtonDisabled(): boolean {
    return !this.notificToUpdate.length;
  }

  showSuccessMessage(event) {
    this.services.noteService.show({
      title: event.length == ONE ? 'La notice a été supprimée avec succès' : 'Les notices ont été supprimées avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }

  showErrorMessage(error, errors: Map<number, TableAsynchronousError[]>) {
    const err = this.getErrorMessage(error);
    this.setError(ONE, err, errors);
    this.asynchronousErrors$.next(errors);
  }

  getErrorMessage(error) {
    const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
    return err;
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }
}
