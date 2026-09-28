/* eslint-disable max-lines-per-function */
import { Component, Input, OnInit } from '@angular/core';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { SearchCommande } from '@app/models/searchCommande';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauCompareCommandeService } from '../service/tableau-compare-commande.service';

@Component({
  selector: 'app-compare-modal',
  templateUrl: './compare-modal.component.html',
  styleUrls: ['./compare-modal.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class CompareModalComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  /**   * Titre de la popup   */
  @Input() title: string;
  /**   * Label et icône du premier bouton (En partant de la droite)   * Champ optionnel, sera affiché par défaut "Confirmer"   */
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  /**   * Label et icône du premier bouton (En partant de la droite)   * Champ optionnel, sera affiché par défaut "Abandonner"   */
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };
  /**   * Validité du formulaire, désactive le premier bouton si faux.   * Champ optionnel   */
  @Input() isFormValid = true;

  @Input() environnementList: string[] = [];
  @Input() allOrgReg: any = [];

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];
  rowDetails: any = [];

  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  params: any;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  codesEnvironnement: any = [];
  subscriptions: Subscription[] = [];
  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauService: TableauCompareCommandeService,
    private generateFileService: GenerateFileService,
    private commandeService: ApiAdelaideCommandeService
  ) {}

  ngOnInit(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();

    // Set up column definitions dynamically
    const keys = !!this.rowData.length && Object.keys(this.rowData[0]);
    this.columnDefs = !!keys.length && keys.map(key => ({ field: key }));
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Évènement pour redimensionne les colonnes dans le cas où on change les filtres
    this.gridApi.addEventListener('paginationChanged', () => this.gridApi.sizeColumnsToFit());
    this.gridApi.setGridOption('loading', false);
  }
  closePopup() {
    this.modalRef.close();
  }

  comparer(a: any, b: any): number {
    // Custom sorting order based on application, organisme, and sortHelper
    return ['application', 'codeReg', 'organisme', 'sortHelper'].reduce((result: number, key: string) => {
      // Compare les valeurs de chaque propriété
      if (result === 0) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
      }
      return result;
    }, 0);
  }

  lister($event: any): void {
    const searchCommande: SearchCommande = $event;
    this.subscriptions.push(
      this.commandeService
        .compareCommandes(searchCommande.codesEnvironnement, searchCommande.codesOrganisme, searchCommande.codesApplication)
        .pipe(take(1))
        .subscribe((result: any) => {
          const data = result.data.compareCommandes;
          const distinctEnvAppOrgFromData = this.getDistinctEnvAppOrgFromData(data);
          const environnements = searchCommande.codesEnvironnement.length
            ? searchCommande.codesEnvironnement
            : distinctEnvAppOrgFromData.environnements;
          const applications = searchCommande.codesApplication.length ? searchCommande.codesApplication : distinctEnvAppOrgFromData.applications;
          const organismes = searchCommande.codesOrganisme.length ? searchCommande.codesOrganisme : distinctEnvAppOrgFromData.organismes;

          this.getRowDetailForExport(data, environnements);
          this.getRowDataGrid(data, environnements, applications, organismes);
        })
    );
  }

  getRowDetailForExport(data, environnements: string[]) {
    this.rowDetails = data
      .map((com: any) => ({
        application: com.application,
        Région: com.codeReg,
        organisme: com.organisme,
        sortHelper: com.sortHelper,
        ...{
          ...environnements.reduce((acc: {}, codenv: string) => {
            const envs: string[] = com.environnements.split(',');
            envs.includes(codenv) ? (acc[codenv] = com.sortHelper) : (acc[codenv] = null);
            return acc;
          }, {}),
        },
      }))
      .sort((a, b) => this.comparer(a, b));
  }

  getRowDataGrid(data, environnements: string[], applications: string[], organismes: string[]) {
    this.rowData = applications
      .map((codapp: string) => ({
        ...organismes.map((codorg: string) => ({
          application: codapp,
          Région: data.find(c => c.organisme === codorg)?.codeReg ?? '',
          organisme: codorg,
          ...{
            ...environnements.reduce((acc: {}, codenv: string) => {
              acc[codenv] = data.filter(
                (c: any) => c.environnements.split(',').includes(codenv) && c.organisme == codorg && c.application == codapp
              ).length;
              return acc;
            }, {}),
          },
        })),
      }))
      .flatMap(e => Object.values(e))
      .sort((a, b) => this.comparer(a, b));

    const keys = Object.keys(this.rowData?.[0] ?? {});
    this.columnDefs = keys.map((key: string) => ({ field: key }));
  }

  getDistinctEnvAppOrgFromData(data) {
    const applications = new Set<string>();
    const organismes = new Set<string>();
    const environnements = new Set<string>();
    data.forEach(item => {
      applications.add(item.application);
      organismes.add(item.organisme);
      item.environnements.split(',').forEach(env => {
        const value = env.trim();
        if (value) {
          environnements.add(value);
        }
      });
    });
    const result = {
      applications: [...applications],
      organismes: [...organismes],
      environnements: [...environnements],
    };
    return result;
  }

  gridHeight(): number {
    return SharedUtil.getGridHeight(this.rowData, 170, 30, 7);
  }

  exportDetails(event: any) {
    const title = 'Comparaison des Commandes';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const data = [];
    const headers = [];

    Object.keys(this.rowDetails[0]).forEach((elm: string) => elm != 'sortHelper' && headers.push(elm));
    this.rowDetails.forEach(obj => data.push(headers.map(h => obj[h])));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }
}
