import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopupErreurComponent } from '@app/admin/popup/popup-erreur/popup-erreur.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { NUM_SECOND_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { NotficCreateInputInterface } from '@app/models/gestion-fichier-edition/notices/notfic';
import { TableauAffectationNoticeService } from '@app/produit/notice/service/tableau-affectation-notice.service';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { getFormName, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbActiveModal, NgbDate, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { SearchNoticesByCriteres } from '../../model/search-notices-by-criteres';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_AJOUTER_AUTH } from '@app/services/permission/PermissionsFile';

@Component({
  selector: 'app-modal-ajout',
  templateUrl: './modal-ajout.component.html',
  styleUrls: ['./modal-ajout.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ModalAjoutComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() selectedNotice: string;
  @Output() passEntry = new EventEmitter<any>();

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  rowData = [];
  totalNotices = ZERO;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  form: FormGroup;
  formName = getFormName();
  isSomeChangeNotSubmited = false;
  toMinDate: NgbDateStruct;
  notificToCreate: NotficCreateInputInterface[] = [];
  subscriptions: Subscription[] = [];
  private boundTableDataUpdated = this.tableDataUpdated.bind(this);

  fb = inject(FormBuilder);
  activeModal = inject(NgbActiveModal);
  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauAffectationNoticeService = inject(TableauAffectationNoticeService);
  apiNoticesService = inject(ApiNoticesService);
  noteService = inject(NotesService);
  modalService = inject(NgbModal);
  datePipe = inject(DatePipe);
  servicePerm = inject(PermissionService);
  canAddPermPosition = AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES[KEY_AJOUTER_AUTH];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.servicePerm.hasPermission(this.canAddPermPosition));
    this.columnDefs = this.tableauAffectationNoticeService.getColumnDefsPopupCreate();
    this.overlayNoRowsTemplate = this.tableauAffectationNoticeService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.addEventListener('rowDataUpdated', this.boundTableDataUpdated);
  }

  tableDataUpdated(): void {
    this.getNotificToCreate();
  }

  resetChanges() {
    this.form.reset();
    this.notificToCreate = [];
    this.isSomeChangeNotSubmited = false;
  }

  lister(event) {
    this.subscriptions.push(
      this.apiNoticesService
        .findFichiersForAffectationNotice(this.getQuerySearchFromEvent(event))
        .pipe(take(1))
        .subscribe(response => {
        this.rowData = response.data.findFichiersForAffectationNotice.map(e => {
          e.codenv_codorg_codapp = e.codenv + '-' + e.codorg + '-' + e.codapp;
          e.codcom_codfic = e.codcom + '-' + e.codfic;
          e.isAuthorisedToReset = false;
          e.dnotid_old = e.dnotid;
          e.dnotit_old = e.dnotit;
          return e;
        });
        this.totalNotices = response.data.findFichiersForAffectationNotice.length;
        this.resetChanges();
      })
    );
  }

  getQuerySearchFromEvent(event): SearchNoticesByCriteres {
    const query = new SearchNoticesByCriteres();
    query.codnot = this.selectedNotice;
    query.codenv = event[this.formName.ENVIRONNEMENT];
    query.codorg = event[this.formName.ORGANISME];
    query.codapp = event[this.formName.APPLICATION];
    query.codcom = event[this.formName.COMMANDE];
    query.codfic = event[this.formName.FICHIER];
    query.refimp = event[this.formName.REFIMPRIME];
    return query;
  }

  initForm() {
    this.form = this.fb.group({
      dateDeb: [''],
      dateFin: [''],
    });
    this.onChangeDateDeb();
  }

  onChangeDateDeb() {
    this.subscriptions.push(
      this.form.get('dateDeb').valueChanges.subscribe((value: NgbDate) => {
        this.toMinDate = value;
        if (value && this.form.get('dateFin').value && this.form.get('dateFin').value.before(value)) {
          this.form.get('dateFin').setValue('');
        }
      })
    );
  }

  closePopup() {
    if (this.isSomeChangeNotSubmited) {
      const modalWarning = this.modalService.open(PopupErreurComponent);
      modalWarning.componentInstance.messages = [
        'Changement non sauvegardé',
        'Des modifications non enregistrées ont été détectées.',
        'Êtes-vous sûr de vouloir quitter ?',
      ];
      modalWarning.result.catch(error => {
        if (error == NUM_SECOND_BTN_MODAL) {
          this.activeModal.close();
        }
      });
    } else {
      this.activeModal.close();
    }
  }

  validerEnMasse() {
    this.notificToCreate.length > ZERO &&
      this.subscriptions.push(
        this.apiNoticesService.AffectationNotices(this.notificToCreate).subscribe((data: any) => {
          const nbrNotAff = data.data.affectationNotfic.length;
          this.resetChanges();
          this.noteService.show({
            title: nbrNotAff == 1 ? 'Une notice a été affectée avec succès' : nbrNotAff + ' notices ont été affectées avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.passEntry.emit(true);
          this.closePopup();
        })
      );
  }

  updateDateIhm() {
    const dateDeb = this.form.get('dateDeb').value;
    const dateFin = this.form.get('dateFin').value;
    const FORMAT_TO_TRANSFORM = 'yyyy-MM-dd';
    const dateDebIso = !!dateDeb
      ? this.datePipe.transform(dateDeb['year'] + '-' + dateDeb['month'] + '-' + dateDeb['day'], FORMAT_TO_TRANSFORM)
      : null;
    const dateFinIso = !!dateFin
      ? this.datePipe.transform(dateFin['year'] + '-' + dateFin['month'] + '-' + dateFin['day'], FORMAT_TO_TRANSFORM)
      : null;
    this.gridApi.getSelectedNodes().forEach((node: RowNode) => {
      node.setDataValue('dnotid', dateDebIso);
      node.setDataValue('dnotit', dateFinIso);
      node.setDataValue('isAuthorisedToReset', true);
      node.setSelected(false);
    });
    this.getNotificToCreate();
  }

  setNodeDataToNotficCreateInputInterface(nodeData): NotficCreateInputInterface {
    return {
      codnot: this.selectedNotice,
      codenv: nodeData.codenv,
      codorg: nodeData.codorg,
      codapp: nodeData.codapp,
      codcom: nodeData.codcom,
      codfic: nodeData.codfic,
      dnotid: nodeData.dnotid,
      dnotit: nodeData.dnotit,
    };
  }

  isApply(): boolean {
    return this.gridApi?.getSelectedNodes().length > ZERO;
  }

  getNotificToCreate() {
    this.notificToCreate = [];
    this.gridApi?.forEachNode(
      (node: RowNode) => node.data.isAuthorisedToReset && this.notificToCreate.push(this.setNodeDataToNotficCreateInputInterface(node.data))
    );
    this.isSomeChangeNotSubmited = this.notificToCreate.length > ZERO ? true : false;
  }

  isValid(): boolean {
    return this.notificToCreate.length > ZERO;
  }

  ngOnDestroy(): void {
    this.gridApi?.removeEventListener('rowDataUpdated', this.boundTableDataUpdated);
  }
}
