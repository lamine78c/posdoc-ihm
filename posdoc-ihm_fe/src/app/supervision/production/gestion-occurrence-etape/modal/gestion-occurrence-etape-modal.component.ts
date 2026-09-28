import { LoginService } from '@acoss/prisme-angular-intranet';
import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { GestionOccurrenceEtapeInterface } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { GestionOccurrenceEtapePayloadModel } from '@app/models/supervision/production/gestion-occurrence-etape-payload-model';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { TableauGestionOccEtapeService } from '@app/supervision/production/gestion-occurrence-etape/modal/service/tableau/tableau-gestion-occ-etape.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, RowDataUpdatedEvent, RowNode } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ValideOrInvalideGenEtpPayload } from '../../occurrence-etape/models/validation-etape-models';
import { FORMID_OCCURRENCES_ETAPES } from '@app/shared/utils/Constants_formid';
import { ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-gestion-occurrence-etape-modal',
  templateUrl: './gestion-occurrence-etape-modal.component.html',
  styleUrls: ['./gestion-occurrence-etape-modal.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class GestionOccurrenceEtapeModalComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  @Input() searchOccurrenceEtapeData: GestionOccurrenceEtapeInterface;
  @Input() displayFilterButton: boolean;
  modalTitle: string;
  @ViewChild('gestionOccEtapeComponentContainer', { read: ViewContainerRef, static: true }) gestionOccEtapeComponentContainer: ViewContainerRef;
  totalOccEtape: number;
  columnDefs: (ColDef | ColGroupDef)[];
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  gridColumnApi: GridApi;
  searchOccurrenceEtapeResponse: any;
  params: any;
  form: FormGroup;
  stepOptions: { value: string; text: string }[] = Array.from({ length: 100 }, (_, i) => ({ value: i.toString(), text: i.toString() }));
  optionsStatut: { value: string; text: string }[] = [
    { value: 'V', text: 'Validé' },
    { value: 'I', text: 'Invalidé' },
  ];
  isSomeChangeNotSubmited: boolean;
  stepLength: number = 0;
  etapesModify: ValideOrInvalideGenEtpPayload[] = [];
  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private apiGestionOccurrenceEtapeService: ApiGestionOccurrenceEtapeService,
    private tableauGestionOccEtapeService: TableauGestionOccEtapeService,
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private noteService: NotesService,
    private modalService: NgbModal,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    let title = "Gestion des occurrences d'étapes";
    title = this.paramData
      ? title + ' : ' + this.paramData.codEnv + '-' + this.paramData.codOrg + '-' + this.paramData.codApp + '-' + this.paramData.perCod
      : title;
    this.modalTitle = title;

    this.setGridOptions();
    if (this.searchOccurrenceEtapeData) {
      this.searchOccurrenceEtapeResponse = this.searchOccurrenceEtapeData;
    } else {
      this.searchOccurrenceEtape();
    }
    this.initForm();
  }

  /**
   * init form
   */
  initForm() {
    this.form = this.fb.group({
      statut: [],
    });
  }

  setGridOptions() {
    this.gridOptions = {
      rowHeight: 30,
      pagination: true,
      paginationPageSize: 100,
      onRowDataUpdated: (event: RowDataUpdatedEvent) => {
        this.totalOccEtape = event.api.getRenderedNodes().filter((n: RowNode) => n.hasChildren()).length ?? 0;
      },
      groupSelectsChildren: true,
      ...this.tableauConfigurationBuilderService.createGridConfiguration(true),
      autoGroupColumnDef: {
        headerName: '',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        enableGrouping: true,
      } as ExtendedColDef,
      floatingFiltersHeight: ZERO,
    };

    this.columnDefs = this.tableauGestionOccEtapeService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauGestionOccEtapeService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  setOccurrenceEtapePayload() {
    const payload = new GestionOccurrenceEtapePayloadModel();
    payload.codenv = this.paramData.codEnv ? this.paramData.codEnv : null;
    payload.codorg = this.paramData.codOrg ? this.paramData.codOrg : null;
    payload.codapp = this.paramData.codApp ? this.paramData.codApp : null;
    payload.percod = this.paramData.perCod ? this.paramData.perCod : null;
    payload.codcom = null;
    payload.codfic = null;
    payload.codgam = null;
    payload.codsit = null;
    payload.codres = null;
    payload.codser = null;
    payload.typetp = null;
    payload.statut = null;
    payload.codver = null;
    payload.typdat = null;
    payload.datdeb = null;
    payload.datfin = null;
    return payload;
  }

  searchOccurrenceEtape() {
    const occurrenceEtapePayload = this.setOccurrenceEtapePayload();
    this.subscriptions.push(
      this.apiGestionOccurrenceEtapeService
        .getOccurrenceEtapeData(occurrenceEtapePayload)
        .pipe(take(1))
        .subscribe(
          response => {
            this.searchOccurrenceEtapeResponse = response.data.searchOccurrenceEtape;
          },
          error => {
            const errorMessage = error?.errors?.[0]?.message || 'Une erreur est survenue';
            this.noteService.show({
              title: 'Une erreur est survenue',
              classname: 'note-erreur',
              body: errorMessage,
              category: ToastCategoryEnum.ERROR,
            });
          }
        )
    );
  }

  appliquer(): void {
    const newStatus = this.form.get('statut').value;
    this.isSomeChangeNotSubmited = true;
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      // maj status dans tableau grid
      newStatus && node.setDataValue('statut', newStatus);
      // chercher l'étape selected la liste
      const index = this.etapesModify.findIndex(e => e.idetap == node.data.id);
      if (index > -1) {
        // si trouvé, maj status
        this.etapesModify[index].statut = newStatus;
      } else {
        // sinon, ajoute dans la liste
        const etapeSelected = new ValideOrInvalideGenEtpPayload();
        etapeSelected.idetap = node.data.id;
        etapeSelected.statut = newStatus;
        etapeSelected.formid = FORMID_OCCURRENCES_ETAPES;
        etapeSelected.user = this.getUtilisateur();
        this.etapesModify.push(etapeSelected);
      }
    });
    // déselection
    this.gridApi.deselectAll();
  }

  isAppliquerAuthorised(): boolean {
    const newStatus = this.form.get('statut').value;
    const isSomeNodesSelected = !!this.gridApi?.getSelectedNodes()?.length;
    return newStatus && isSomeNodesSelected;
  }

  isValiderAuthorised(): boolean {
    return this.etapesModify.length > 0;
  }

  valider(): void {
    this.stepLength = this.etapesModify.length;
    this.apiGestionOccurrenceEtapeService.valideOuInvalideGenEtp(this.etapesModify).subscribe({
      next: () => {
        this.noteService.show({
          title: this.stepLength === 1 ? 'La ligne a bien été mise à jour' : 'Les lignes ont bien été mises à jour',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        this.appliquer();
        this.closePopup();
      },
      error: error => {
        this.noteService.show({
          title: error.graphQLErrors[0].message,
          classname: 'note-erreur',
          category: ToastCategoryEnum.ERROR,
        });
      },
    });
  }

  dismissPopup() {
    if (this.isSomeChangeNotSubmited) {
      // Ouverture du popup de confirmation
      this.openConfirmationModal();
    } else {
      this.closePopup();
    }
  }

  openConfirmationModal() {
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.messages = ['Confirmation', 'Attention'];
    modalRef.componentInstance.rowDataArray = ['Les modifications effectuées seront perdues.'];
    modalRef.componentInstance.firstButton = { label: 'Confirmer', icone: 'icon-b_valid' };
    modalRef.componentInstance.secondButton = { label: 'Abandonner', icone: 'icon-b_cancel' };
    modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
      if (numButton === NUM_FIRST_BTN_MODAL) {
        this.closePopup();
      }
    });
  }

  closePopup(): void {
    this.activeModal.dismiss();
    this.isSomeChangeNotSubmited = false;
  }

  goToGestionOccurrenceEtape() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      fragment: "gestion des occurrences d'étapes",
      queryParamsHandling: 'preserve',
    });
    this.activeModal.close();
  }

  getUtilisateur() {
    return this.loginService.getIdentifiantUtilisateur();
  }
}
