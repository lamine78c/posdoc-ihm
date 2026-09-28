import { inject, Injectable } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { DateEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/date-editor/date-editor.component';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { CreateUpdateNoticeQuery } from '@app/models/payload/create-update-notice';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FIFTY, ONE, PORNOT_LABEL, TEN, TWELVE, ZERO } from '@app/shared/utils/Constants';
import ConvertorUtil from '@app/shared/utils/convertorUtil';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { CellClickedEvent, ColDef } from 'ag-grid-community';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableauNoticeService {
  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly noticesUpdated = new BehaviorSubject<any[]>([]);
  private stateHeaderName: string = null;
  private isNoticesActives = true;

  private readonly servicePerm = inject(PermissionService);
  private readonly formatterService = inject(FormattersService);
  private readonly apiNoticesService = inject(ApiNoticesService);
  private readonly noteService = inject(NotesService);
  private readonly tableauUtilService = inject(TableauUtilService);

  optionsPornot = [PORNOT_LABEL.L, PORNOT_LABEL.R, PORNOT_LABEL.N];

  constructor() {
    // do nothing
  }

  getColumnDefs(permission: any, isNoticesActives: boolean): ColDef[] {
    this.isNoticesActives = isNoticesActives;
    this.stateHeaderName = this.getColStateHeaderName();
    const params: ParamColDefInterface = {
      delete: {
        sortable: this.stateHeaderName !== 'Activer',
        cellRendererParams: {
          idsLabel: ['codnot'],
          messages: [
            "Suppression d'une notice",
            'Vous êtes sur le point de supprimer la notice',
            'Vous êtes sur le point de supprimer les notices',
            'Suppression des notices',
            'Les notices suivantes ne peuvent pas être supprimées',
            'La notice suivante ne peut pas être supprimée',
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: false,
    };
    const colsDefAction = this.tableauUtilService.getColsDefAction(permission, paramColShow, params);
    const colsDef = [
      this.getColUploadFile(permission),
      this.getColNotice(),
      this.getColDesignation(),
      this.getColFormat(),
      this.getColPoids(),
      this.getColPortee(),
      this.getColSite(),
      this.getColDateRecep(),
      this.getColState(permission, this.stateHeaderName),
    ];
    return colsDefAction.concat(colsDef);
  }

  private getColUploadFile(permission: any): ColDef {
    return {
      headerName: '',
      field: 'uploadFile',
      width: 35,
      minWidth: 35,
      maxWidth: 65,
      sortable: false,
      cellRenderer: 'actionRendererUploadFile',
      headerClass: 'no-border',
      initialHide: !this.servicePerm.hasPermission(permission.uploader),
    };
  }

  private getColNotice(): ColDef {
    return {
      headerName: 'Notice',
      field: 'codnot',
      flex: 1,
      minWidth: 100,
      sort: 'asc',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'codnot',
        canEditOnlyOnNewRow: true,
        allowedCharacters: [' ', '#', '%', '-', '_', '/'],
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ONE, TWELVE)],
        isLink: true,
        pdfProperty: 'pdfFilePath',
      },
    };
  }

  private getColDesignation(): ColDef {
    return {
      headerName: 'Désignation',
      field: 'libnot',
      flex: 1,
      minWidth: 360,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libnot',
        canEditOnlyOnNewRow: false,
        allowedCharacters: [
          ' ',
          '!',
          '"',
          '#',
          '$',
          '%',
          '&',
          "'",
          '(',
          ')',
          '*',
          '+',
          ',',
          '-',
          '.',
          '/',
          ':',
          ';',
          '<',
          '=',
          '>',
          '?',
          '@',
          '[',
          '\\',
          ']',
          '^',
          '_',
          '`',
          '{',
          '|',
          '}',
          '~',
          'é',
          'è',
          'à',
          'ç',
          'ù',
          'ô',
          'î',
          'â',
          'ê',
          'û',
          'ë',
          'ï',
          'ü',
          'ö',
          'ä',
          'ÿ',
        ],
        validators: [CustomValidators.lenghtValidation(ONE, FIFTY)],
      },
    };
  }

  private getColFormat(): ColDef {
    return {
      headerName: 'Format',
      field: 'fornot',
      flex: 1,
      minWidth: 80,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'fornot',
        canEditOnlyOnNewRow: false,
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ONE, TEN)],
      },
    };
  }

  private getColPoids(): ColDef {
    return {
      headerName: 'Poids',
      field: 'poinot',
      flex: 1,
      minWidth: 80,
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      cellDataType: 'text',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'poinot',
        canEditOnlyOnNewRow: false,
        validators: [CustomValidators.required(), CustomValidators.numberValidator(), CustomValidators.maxValueValidator(999999)],
      },
      cellStyle: { 'justify-content': 'flex-end' },
    };
  }

  private getColPortee(): ColDef {
    return {
      headerName: 'Portée',
      field: 'pornot',
      flex: 1,
      minWidth: 110,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'pornot',
        canEditOnlyOnNewRow: false,
        values: this.optionsPornot,
        hasBlankOption: true,
        validators: [CustomValidators.required()],
      },
      onCellValueChanged: params => {
        // dynamic change the value and the validators of another column
        const rendererInstances = params.api.getCellRendererInstances({ rowNodes: [params.node], columns: ['codsit'] });
        const codsitRenderer = rendererInstances[0] as any;
        // récupérer le FormControl
        const codsitControl = codsitRenderer.form.get(codsitRenderer.params.formKey);
        // recalcul dynamique des validators
        if (params.data.pornot === PORNOT_LABEL.N) {
          params.node.setDataValue('codsit', null);
          codsitControl.setValidators([]);
        } else {
          codsitControl.setValidators([CustomValidators.required()]);
        }
        codsitControl.updateValueAndValidity();
        params.api.dispatchEvent({ type: 'rowDataUpdated' });
      },
    };
  }

  private getColSite(): ColDef {
    return {
      headerName: 'Site',
      field: 'codsit',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'codsit',
        canEditOnlyOnNewRow: false,
        values: [],
        hasBlankOption: true,
        paramsDynamicValidators: { formKey: 'pornot', value: PORNOT_LABEL.N, validators: [] },
        validators: [CustomValidators.required()],
      },
      onCellValueChanged: params => {
        // dynamic change the value and the validators of another column
        const rendererInstances = params.api.getCellRendererInstances({ rowNodes: [params.node], columns: ['codsit'] });
        const codsitRenderer = rendererInstances[0] as any;
        // récupérer le FormControl
        const codsitControl = codsitRenderer.form.get(codsitRenderer.params.formKey);
        if (params.data.codsit && params.data.pornot === PORNOT_LABEL.N) {
          params.node.setDataValue('pornot', null);
          codsitControl.setValidators([CustomValidators.required()]);
        }
        codsitControl.updateValueAndValidity();
        params.api.dispatchEvent({ type: 'rowDataUpdated' });
      },
    };
  }

  private getColDateRecep(): ColDef {
    return {
      headerName: 'Date réception',
      field: 'dnotir',
      flex: 1,
      minWidth: 120,
      sortable: true,
      cellDataType: 'text',
      cellRenderer: DateEditorComponent,
      cellRendererParams: {
        formKey: 'dnotir',
        canEditOnlyOnNewRow: false,
      },
    };
  }

  getColState(permission: any, headerName: string): ColDef {
    return {
      headerName: headerName,
      field: 'perime',
      sortable: false,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'perime',
        isAllTimeClickable: true,
        isnotEditableOnNewRow: true,
      },
      valueGetter: () => {
        return false;
      },
      onCellClicked: (param: CellClickedEvent) => {
        const isEditing = param.colDef?.cellRendererParams?.isEditing ?? false;
        if (!isEditing) {
          // update notice state seulement si on n'est pas dans le mode edit
          this.changeNoticeState(param);
        }
      },
      initialHide: !this.servicePerm.hasPermission(permission.modifier),
    };
  }

  changeNoticeState(param: CellClickedEvent) {
    const createUpdateNoticeQuery = this.getCreateUpdateNoticeQuery(param.data);
    createUpdateNoticeQuery.pornot = ConvertorUtil.convertPornotLabelToCode(createUpdateNoticeQuery.pornot);

    this.apiNoticesService.updateNotice(createUpdateNoticeQuery).subscribe(
      () => {
        const message: string = !this.isNoticesActives ? 'a été passée à l\'état "Active"' : 'a été passée à l\'état "Périmée"';
        this.noteService.show({
          title: `La notice ${createUpdateNoticeQuery.codnot} ${message}`,
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        // Hide updated row in table
        const rowsData = [...param.api.getRenderedNodes()].filter(node => node.data.codnot !== param.node.data.codnot);
        param.api.setGridOption(
          'rowData',
          rowsData.map(node => node.data)
        );
      },
      error => {
        param.node.data.perime = +!this.isNoticesActives;
        param.api.redrawRows({ rowNodes: [param.node] });
        this.noteService.show({
          title: error.graphQLErrors[ZERO].message,
          classname: 'note-erreur',
          category: ToastCategoryEnum.ERROR,
        });
      }
    );
  }

  getCreateUpdateNoticeQuery(data: any): CreateUpdateNoticeQuery {
    return {
      codnot: data.codnot,
      libnot: data.libnot,
      fornot: data.fornot,
      poinot: data.poinot,
      pornot: data.pornot,
      dnotir: data.dnotir,
      perime: this.stateHeaderName === 'Activer' ? ZERO : ONE,
      codsit: data.codsit,
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  notifyNoticesUpdated(notices: any[]): void {
    this.noticesUpdated.next(notices);
  }

  getNoticesUpdatedListener(): Observable<any[]> {
    return this.noticesUpdated.asObservable();
  }

  getColStateHeaderName(): string {
    return this.isNoticesActives ? 'Périmer' : 'Activer';
  }
}
