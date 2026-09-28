import { Component, inject } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ExtendedICellRendererParams, TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { AdresseRetourDetails } from '@app/models/adresseRetour';
import { AddType } from '@app/models/enums/add-type';
import { ModalAddAdresseFichierComponent } from '@app/produit/adresse-retour/modal/modal-add-adresse-fichier/modal-add-adresse-fichier.component';
import { CommunicationAdresseRetourService } from '@app/produit/adresse-retour/service/communication-adresse-retour.service';
import { TableauAdresseRetourService } from '@app/produit/adresse-retour/service/tableau-adresse-retour.service';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-detail-adresse-retour',
  templateUrl: './detail-adresse-retour.component.html',
  standalone: false,
})
export class DetailAdresseRetourComponent implements ICellRendererAngularComp {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  params;

  addType = AddType.MODAL;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  subscriptions: Subscription[] = [];

  private readonly tableauAdresseRetourService = inject(TableauAdresseRetourService);
  private readonly modalService = inject(NgbModal);
  private readonly communicationAdresseRetourService = inject(CommunicationAdresseRetourService);
  private readonly apiAdelaideAdresseRetourService = inject(ApiAdelaideAdresseRetourService);
  private readonly noteService = inject(NotesService);
  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS;
  canPermPosition = this.auth[KEY_MODIFIER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor() {
    // do nothing
  }

  agInit(params: ExtendedICellRendererParams): void {
    this.rowData = params.data.detail;
    if (params.data.newRow) {
      this.canPermPosition = -ONE;
    }

    this.gridOptions = this.tableauAdresseRetourService.createGridConfiguration(this.isColSelectAll);
    this.gridOptions.floatingFiltersHeight = ZERO;
    this.params = params;
    this.columnDefs = this.tableauAdresseRetourService.getDetailColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableauAdresseRetourService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.setGridOption('loading', true);
    this.getData();
  }

  getData(): void {
    this.rowData = this.params.data.detail?.map((data: AdresseRetourDetails) => ({
      codeEnv: data.codeEnv,
      codeApp: data.codeApp,
      codeCom: data.codeCom,
      codeFich: data.codeFich,
      codeOrg: data.codeOrg,
      codeProd: data.codeProd,
      refImprime: data.refImprime,
      libFichier: data.libFichier,
      typeFormat: data.typeFormat,
      typeMultif: data.typeMultif,
      typeSupport: data.typeSupport,
      typeSig: data.typeSig,
      page: data.page,
      eclatement: data.eclatement,
    }));

    this.gridApi.setGridOption('loading', false);
  }

  onDeleteRow(event: AdresseRetourDetails[]) {
    const updatesDTO: AdresseRetourDetails[] = [];
    event.forEach(f => {
      f.codeAdr = null;
      updatesDTO.push(f);
    });
    this.appelServiceUpdateFichiers(updatesDTO);
  }

  appelServiceUpdateFichiers(updatesDTO: AdresseRetourDetails[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideAdresseRetourService
        .updateFichiersFromAdressesRetour(updatesDTO)
        .pipe(
          switchMap(result => {
            return of(result);
          })
        )
        .subscribe({
          next: () => {
            this.noteService.show({
              title: "L'adresse retour a été mise à jour avec succès",
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.communicationAdresseRetourService.callOtherComponentMethod();
          },
          error: error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
            this.setError(ONE, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
    );
  }

  openPopup() {
    const modalRef = this.modalService.open(ModalAddAdresseFichierComponent);
    modalRef.componentInstance.adresseSelected = this.params.data.code;
    modalRef.componentInstance.orgSelected = this.params.data.codeOrganisme;
    modalRef.componentInstance.title = 'Ajout des articles';
    modalRef.componentInstance.passEntry.subscribe((receivedEntry: number) => {
      if (receivedEntry != ZERO) {
        this.communicationAdresseRetourService.callOtherComponentMethod();
      }
    });
  }

  refresh(): boolean {
    return false;
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }
}
