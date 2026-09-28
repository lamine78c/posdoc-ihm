import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import {
  GetPreselectedExemplaireInterface,
  initExemplaireByFilterQuery,
} from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { TableauExemplaireService } from '../service/tableau-exemplaire.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';

@Component({
  selector: 'app-distribution-exemplaires',
  templateUrl: './distribution-exemplaires.component.html',
  styleUrls: ['./distribution-exemplaires.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DistributionExemplairesComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];

  nombreExemplairesTotal;

  columnDefs: ColDef[];

  params: GridReadyEvent;
  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  formPreselection: FormGroup;
  applicationOptions = [];
  commandeOptions = [];
  organismes;
  isEnvOptionsInitialized = false;
  isOrgOptionsInitialized = false;

  formName = getFormName();
  subscriptions: Subscription[] = [];

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauExemplaireService = inject(TableauExemplaireService);
  private readonly apiAdelaideService = inject(ApiAdelaideDistributionService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly noteService = inject(NotesService);

  constructor() {
    // do noting
  }

  ngOnInit(): void {
    this.initForm();
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    // Colonnes du tableau
    this.columnDefs = this.tableauExemplaireService.getColumnDefs();
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauExemplaireService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;
  }

  private initForm() {
    this.formPreselection = this.fb.group({
      [this.formName.COMMANDE]: ['', CustomValidators.required()],
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.ENVIRONNEMENT]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.FICHIER]: [''],
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.subscriptions.push(
      this.apiAdelaideService.getAllOrganismes().pipe(take(1)).subscribe((result: any) => {
        this.organismes = result.data.allOrganismes;
        this.organismeData$.next(result.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
      })
    );
  }

  /**
   * Ajoute les erreurs dans la map
   */
  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  export(event: any) {
    const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    const selectedEnvs = Object.keys(rawEnv).filter(k => rawEnv[k]);
    const selectedOrgs = [];
    const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
    SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
    const selectedApp = this.formPreselection.get(this.formName.APPLICATION).value;
    const selectedCom = this.formPreselection.get(this.formName.COMMANDE).value;
    const selectedFic = this.formPreselection.get(this.formName.FICHIER).value;
    if (selectedEnvs.length === 0 || selectedOrgs.length === 0) {
      this.showWarningExportMessageEnvOrg();
      return;
    }
    this.subscriptions.push(
      this.apiAdelaideService
        .getPreselectedData(
          initExemplaireByFilterQuery(
            selectedEnvs,
            selectedOrgs,
            selectedApp ? [selectedApp] : null,
            selectedCom ? [selectedCom] : null,
            selectedFic ? [selectedFic] : null
          )
        )
        .pipe(take(1))
        .subscribe(result => {
          const title = 'Liste des exemplaires';
          const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
          const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
            .getColumnDefs()
            .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
          const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
          const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
          const data = [];
          result.data.getPreselectedExemplaire.sort((a, b) => this.compare(a, b)).forEach(exempl => data.push(this.getRowDataExport(exempl, fields)));
          this.generateFileService[fileServiceMap[event.type]](data, headers, title, { columnDefs: columnDefs });
        })
    );
  }

  showWarningExportMessageEnvOrg() {
    this.noteService.show({
      title: 'Veuillez choisir les environnements et les organismes',
      classname: 'note-avertissement',
      category: ToastCategoryEnum.WARNING,
    });
  }

  compare(a: GetPreselectedExemplaireInterface, b: GetPreselectedExemplaireInterface): number {
    return (
      a.codenv.localeCompare(b.codenv) ||
      a.codorg.localeCompare(b.codorg) ||
      a.codapp.localeCompare(b.codapp) ||
      a.codcom.localeCompare(b.codcom) ||
      a.codfic.localeCompare(b.codfic)
    );
  }
  getRowDataExport(exempl: GetPreselectedExemplaireInterface, fields: string[]): string[] {
    return fields.map(field => {
      if (field === 'codreg' && exempl.codorg) {
        return this.organismes.filter(o => o.code == exempl.codorg)[0]?.codeRegion;
      } else {
        return exempl[field] !== '' ? exempl[field] : null;
      }
    });
  }

  validerPreselection() {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    const selectedEnvs = Object.keys(rawEnv).filter(k => rawEnv[k]);
    const selectedOrgs = [];
    const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
    SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
    const selectedApp = this.formPreselection.get(this.formName.APPLICATION).value;
    const selectedCom = this.formPreselection.get(this.formName.COMMANDE).value;
    const selectedFic = this.formPreselection.get(this.formName.FICHIER).value;
    this.subscriptions.push(
      this.apiAdelaideService
        .getPreselectedData(
          initExemplaireByFilterQuery(selectedEnvs, selectedOrgs, [selectedApp], selectedCom ? [selectedCom] : null, selectedFic ? [selectedFic] : null)
        )
        .pipe(take(1))
        .subscribe(result => {
          this.nombreExemplairesTotal = result.data.getPreselectedExemplaire.length;
          this.rowData = result.data.getPreselectedExemplaire.map(exemplaire => ({
            ...exemplaire,
            codreg: this.organismes.filter(o => o.code == exemplaire.codorg)[0]?.codeRegion,
          }));
          if (!this.nombreExemplairesTotal) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          }
        })
    );
  }
}
