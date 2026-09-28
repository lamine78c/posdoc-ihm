import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauReferenceService } from '@app/produit/fond-page/reference/service/tableau-reference.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { ModalImprimeComponent } from '@app/produit/fond-page/reference/popup/modal-component/modal-imprime.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { AUTH, KEY_MODIFIER_AUTH } from '@app/services/permission/PermissionsFile';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { PermissionService } from '@app/services/permission/permission.service';
import { ApiAdelaideImprimeService } from '@app/services/api-adelaide-imprime.service';

@Component({
  selector: 'app-distribution-reference',
  templateUrl: './distribution-reference.component.html',
  styleUrls: ['./distribution-reference.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DistributionReferenceComponent implements OnInit, OnDestroy {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  gridApi: GridApi;

  rowData: any = [];

  nombreReferencesTotal: number;

  columnDefs: ColDef[];

  params: GridReadyEvent;

  subscription: Subscription;

  subscriptions: Subscription[] = [];

  synchroniseReferenceList: any;

  showSearch: boolean = true;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  imprimeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  imprimes: any = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES;
  readonly canEditPermPosition = this.auth[KEY_MODIFIER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauReferenceService = inject(TableauReferenceService);
  private readonly apiAdelaideFichierService = inject(ApiAdelaideFichierService);
  private readonly apiAdelaideImprimeService = inject(ApiAdelaideImprimeService);
  private readonly modalService = inject(NgbModal);
  private readonly noteService = inject(NotesService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // Colonnes du tableau
    this.columnDefs = this.tableauReferenceService.getColumnDefs(this.isColSelectAll);
    // Tableau tableau s'il n'y a pas de données
    this.overlayNoRowsTemplate = this.tableauReferenceService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codeOrg').floatingFilterComponentParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'refImprime').cellRendererParams.selectData = this.imprimeData$;
  }

  lister($event: any) {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideFichierService
        .findFichiersForUpdatingReference($event.codesEnv, $event.codesApp, $event.refsImp)
        .pipe(take(1))
        .subscribe((fichiers: any) => {
          this.rowData = fichiers.data.getFichiersForUpdatingReference;
          this.nombreReferencesTotal = fichiers.data.getFichiersForUpdatingReference.length;
          if (!this.nombreReferencesTotal) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          }
          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  reduireSearchDiv(event) {
    this.showSearch = false;
  }
  showSearchDiv(event) {
    this.showSearch = true;
  }

  ngOnDestroy(): void {
    this.subscription && this.subscription.unsubscribe();
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;

    this.subscriptions.push(
      this.apiAdelaideFichierService
        .getAllSelectConfig()
        .pipe(take(1))
        .subscribe((data: any) => {
          this.organismeData$.next(
            (data as any).data.allOrganismes
              //.map(o => ({value: o.code, text: o.code, codeRegion: o.codeRegion}))
              .sort((a, b) => a.code.localeCompare(b.code))
          );
          this.imprimeData$.next(
            (data as any).data.allImprimes.map(e => ({ text: e.reference, value: e.reference })).sort((a, b) => a.text.localeCompare(b.text))
          );
          this.imprimes = (data as any).data.allImprimes
            .map(e => ({ text: e.reference, value: e.reference }))
            .sort((a, b) => a.text.localeCompare(b.text));
        })
    );
  }

  synchroRefList(updatedFichies) {
    let isListOfReferenceEmpty = false;
    if (updatedFichies.length == this.nombreReferencesTotal) {
      isListOfReferenceEmpty = true;
    }
    let environnementsUpdated = [];
    let newReference = updatedFichies[0].refImprime;
    updatedFichies.map(selectedNode => {
      if (!environnementsUpdated.some(codeEnv => codeEnv == selectedNode.codeEnv)) {
        environnementsUpdated.push(selectedNode.codeEnv);
      }
    });
    this.synchroniseReferenceList = {
      isListOfReferenceEmpty: isListOfReferenceEmpty,
      environnementsUpdated: environnementsUpdated,
      newReference: newReference,
    };
  }

  updateGridData(data) {
    this.gridApi.applyTransaction({ remove: data });
    this.gridApi.redrawRows();
  }

  openAddPopup(selectedNodesAndMode: any): void {
    const modalRef = this.modalService.open(ModalImprimeComponent, { windowClass: 'modal-imprime', backdrop: 'static' });
    modalRef.componentInstance.modalRef = modalRef;
    // modalRef.componentInstance.editMode = true
    modalRef.componentInstance.imprimes = this.imprimes;
    modalRef.componentInstance.imprimeSelected = selectedNodesAndMode.selectedNodes[0].data.refImprime;
    modalRef.componentInstance.title = 'Modification en masse des imprimés';
    // modalRef.componentInstance.selectedNodes = selectedNodesAndMode.selectedNodes
    this.subscriptions.push(
      modalRef.componentInstance.passEntry.subscribe(receivedEntry => {
        if (receivedEntry && selectedNodesAndMode.selectedNodes) {
          let updatedFichies = selectedNodesAndMode.selectedNodes.map(selectedNode => ({ ...selectedNode.data, refImprime: receivedEntry }));
          this.apiAdelaideImprimeService.updateFichiersFromFondDePage(updatedFichies).subscribe(() => {
            this.synchroRefList(updatedFichies);
            this.updateGridData([...new Set(selectedNodesAndMode.selectedNodes.map(e => e.data))]);
            modalRef.close();
            this.noteService.show({
              title: 'Les références ont été mises à jour avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
          });
        }
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>): void {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let updatedFichie = [...editedRow][0] ? [...editedRow][0][1] : null;

    if (updatedFichie && !updatedFichie?.newRow) {
      Object.keys(updatedFichie)
        .filter(key => updatedFichie[key] === null)
        .forEach(e => delete updatedFichie[e]);
      this.subscriptions.push(
        this.apiAdelaideImprimeService.updateFichiersFromFondDePage([updatedFichie]).subscribe({
          next: () => {
          this.synchroRefList([updatedFichie]);
          this.gridApi.forEachNode(node => {
            if (
              updatedFichie.codeEnv == node.data.codeEnv &&
              updatedFichie.codeOrg == node.data.codeOrg &&
              updatedFichie.codeCom == node.data.codeCom &&
              updatedFichie.codeApp == node.data.codeApp &&
              updatedFichie.codeFich == node.data.codeFich
            ) {
              this.updateGridData([node.data]);
              return;
            }
          });
          this.noteService.show({
            title: 'La référence du fichie "' + updatedFichie.codeCom + '-' + updatedFichie.codeFich + '" a été mise à jour avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.asynchronousErrors$.next(errors);
        },
          error: error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    }
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
}
