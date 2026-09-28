import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PopupConfirmationComponent } from './popup-confirmation/popup-confirmation.component';
import { TableauPageAccueilService } from './service/tableau-page-accueil.service';
import { PopupCtreateContenuComponent } from './popup-ctreate-contenu/popup-ctreate-contenu.component';
import { Contenu } from '@app/models/contenu';
import { ApiAdelaideRegionService } from '@app/services/api-adelaide-region.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { DatePipe } from '@angular/common';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { ApolloQueryResult } from 'apollo-client';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';

@Component({
  selector: 'app-page-accueil',
  templateUrl: './page-accueil.component.html',
  styleUrls: ['./page-accueil.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class PageAccueilComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  overlayLoadingTemplate = '<span></span>';

  subscriptions: Subscription[] = [];

  // nombre total de message en bdd
  nombreMesageTotal;

  rowData = [];

  columnDefs: ColDef[];
  gridApi: GridApi;
  gridColumnApi: GridApi;

  isEditing = false;
  nodeSelected;

  listRegion = [];

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauPageAccueilService = inject(TableauPageAccueilService);
  private readonly apiAdelaideRegionService = inject(ApiAdelaideRegionService);
  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly modalService = inject(NgbModal);
  private readonly noteService = inject(NotesService);
  private readonly datepipe = inject(DatePipe);

  constructor() {
    // Empty constructor
  }

  ngOnInit(): void {
    this.initGridOptions();

    this.subscriptions.push(
      this.apiAdelaideRegionService.getAllRegions().pipe(take(1)).subscribe((regions: ApolloQueryResult<AllRegionsInterface>) => {
        this.listRegion = regions.data.allRegions.map(e => e.code);
        this.columnDefs = this.tableauPageAccueilService.getColumnDefs(this.listRegion);
        this.columnDefs.find(colDef => colDef.field === 'regions').floatingFilterComponentParams.list = this.listRegion;
      })
    );
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();

    this.gridOptions.rowHeight = 128;

    this.gridOptions.getRowId = (params: GetRowIdParams) => {
      return params.data.id;
    };

    this.gridOptions.rowStyle = { border: '0.5rem' };

    this.gridOptions.onRowClicked = this.rowSelection;

    this.gridOptions.suppressCellFocus = true;
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauPageAccueilService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.subscriptions.push(
      this.apiAdelaideContenuService.getAllContenu().pipe(take(1)).subscribe(data => {
        if (!this.nombreMesageTotal) this.nombreMesageTotal = (data as any).data.allContenus.length;
        const donnee = (data as any).data.allContenus;
        donnee.map(elem => {
          elem.regions = elem.regions.map(e => e.code);
          return elem;
        });
        this.rowData = donnee;
      })
    );
  }

  addRow() {
    this.isEditing = true;

    const modalRef = this.modalService.open(PopupCtreateContenuComponent, { size: '50rem', backdrop: false });
    modalRef.componentInstance.listRegion = this.listRegion;
    modalRef.result
      .then(reason => {
        const newContenu = {} as Contenu;
        newContenu.titre = reason.titre;
        newContenu.dateActivation = this.datepipe.transform(reason.dateActivation, 'yyyy-MM-ddTHH:mm:ss');
        newContenu.dateExpiration = this.datepipe.transform(reason.dateExpiration, 'yyyy-MM-ddTHH:mm:ss');
        newContenu.message = reason.message;
        newContenu.regions = reason.regions;
        this.saveEdition(newContenu, 'add');
      })
      .catch(e => console.error(e));
  }

  saveEdition(contenu, type) {
    contenu.regions = Object.entries(contenu.regions)
      .filter(e => e[1])
      .map(e => {
        return { code: e[0] };
      });
    this.subscriptions.push(
      this.apiAdelaideContenuService.createContenu(contenu).subscribe(data => {
        const createdContenu = (data as any).data.createContenu;
      createdContenu.regions = createdContenu.regions.map(e => e.code);

      if (type == 'add') {
        this.gridApi.applyTransaction({ add: [createdContenu], addIndex: 0 });
        this.noteService.show({
          title: 'Le contenu "' + createdContenu.titre + '" a été créer avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
      } else {
        this.nodeSelected.setData(createdContenu);
        this.noteService.show({
          title: 'Le contenu "' + createdContenu.titre + '" a été mis à jour avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
      }

      // Redraw les lignes afin d'avoir la ligne ajoutée
      this.gridApi.redrawRows();
      this.gridApi.getDisplayedRowAtIndex(0).setSelected(true);
      this.isEditing = false;
      this.gridApi.hideOverlay();
      })
    );
  }

  annuler() {
    this.isEditing = false;
    this.gridApi.hideOverlay();
  }

  edit() {
    const modalRef = this.modalService.open(PopupCtreateContenuComponent, { size: '50rem', backdrop: false });
    modalRef.componentInstance.titre = this.nodeSelected.data.titre;
    modalRef.componentInstance.dateActivation = this.nodeSelected.data.dateActivation;
    modalRef.componentInstance.dateExpiration = this.nodeSelected.data.dateExpiration;
    modalRef.componentInstance.message = this.nodeSelected.data.message;
    modalRef.componentInstance.regions = this.nodeSelected.data.regions;
    modalRef.componentInstance.listRegion = this.listRegion;
    modalRef.result
      .then(reason => {
        const newContenu = {} as Contenu;
        newContenu.id = this.nodeSelected.data.id;
        newContenu.titre = reason.titre;
        newContenu.dateActivation = this.datepipe.transform(reason.dateActivation, 'yyyy-MM-ddTHH:mm:ss');
        newContenu.dateExpiration = this.datepipe.transform(reason.dateExpiration, 'yyyy-MM-ddTHH:mm:ss');
        newContenu.message = reason.message;
        newContenu.regions = reason.regions;
        this.saveEdition(newContenu, 'update');
      })
      .catch(e => console.error(e));
  }

  deleteContenu() {
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.rowDataArray = [this.nodeSelected.data.titre, this.nodeSelected.data.region];

    this.subscriptions.push(
      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        // Dans le cas ou l'utilisateur confirme
        if (numButton === NUM_FIRST_BTN_MODAL) {
          this.subscriptions.push(
            this.apiAdelaideContenuService.deleteContenu(parseInt(this.nodeSelected.data.id)).subscribe(data => {
              this.gridApi.applyTransaction({ remove: [this.nodeSelected.data] });
              this.noteService.show({
                title: 'Le contenu ' + this.nodeSelected.data.titre + ' a été supprimé avec succès',
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
              this.nodeSelected = null;
              // Redraw les lignes afin de prendre en compte la ligne supprimée
              this.gridApi.redrawRows();
            })
          );
        }
      })
    );
  }

  rowSelection = ({ node }) => {
    this.nodeSelected = node;
  };
}
