import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { findDistinctCodenvCodorgCodapp } from '@app/models/supervision/production/distinct-en-org-app-genetp-interface';
import { GestionOccurrenceEtapeInterface } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { GestionOccurrenceEtapePayloadModel } from '@app/models/supervision/production/gestion-occurrence-etape-payload-model';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { getFormIndex, getFormName, TYPE_DATE } from '@app/shared/utils/Constants';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { GestionOccurrenceEtapeModalComponent } from '@app/supervision/production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-search-gestion-occurrence-etape',
  templateUrl: './search-gestion-occurrence-etape.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class SearchGestionOccurrenceEtapeComponent implements OnInit {
  form: FormGroup;
  allOrgReg: any;
  optionsEnv = [];
  optionsApp = [];
  optionsPeriode = [];
  optionsCommande = [];
  optionsFichier = [];
  optionsGamme = [];
  optionsSite = [];
  optionsRessource = [];
  optionsServeur = [];
  optionsEtapeType = [];
  optionsStatut = [];
  optionsVerrou = [];
  optionsDateType = [];
  searchOccurrenceEtapeResponse: GestionOccurrenceEtapeInterface[];
  distinctCodenvCodorgCodapp: findDistinctCodenvCodorgCodapp[];
  toMaxDate: NgbDateStruct;
  defaultStatut = 'S';

  formName = getFormName();
  indexForm = getFormIndex();

  isOrgOptionsInitialized = false;

  formEnv: FormControl;
  formApp: FormControl;
  formOrg: FormGroup;
  formCom: FormControl;
  formFic: FormControl;
  formPeriode: FormControl;
  selectedApp;

  private readonly fb = inject(FormBuilder);
  private readonly apiGestionOccurrenceEtapeService = inject(ApiGestionOccurrenceEtapeService);
  private readonly modalService = inject(NgbModal);
  private readonly datePipe = inject(DatePipe);
  private readonly sessionDataSearchService = inject(SessionDataSearchService);
  private readonly noteService = inject(NotesService);
  private subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    const today = new Date();
    this.toMaxDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.initSearchForm();
    this.initOccurrenceEtapeOptions();
    this.onChangeEnvironnement();
    this.onChangeApplication();
    this.onChangePeriode();
    this.onChangeCommande();
  }

  /**
   * init search form
   */
  initSearchForm() {
    this.form = this.fb.group({
      [this.formName.ENVIRONNEMENT]: [''],
      [this.formName.ORGANISME]: this.fb.group({}),
      [this.formName.APPLICATION]: [''],
      [this.formName.PERIODE]: [''],
      [this.formName.COMMANDE]: [''],
      [this.formName.FICHIER]: [''],
      gamme: [''],
      site: [''],
      ressource: [''],
      serveur: [''],
      etapeType: [''],
      statut: [this.defaultStatut],
      verrou: [''],
      dateType: [''],
      dateDebut: [''],
      dateFin: [''],
    });

    this.formEnv = this.form.get(this.formName.ENVIRONNEMENT) as FormControl;
    this.formApp = this.form.get(this.formName.APPLICATION) as FormControl;
    this.formOrg = this.form.get(this.formName.ORGANISME) as FormGroup;
    this.formCom = this.form.get(this.formName.COMMANDE) as FormControl;
    this.formFic = this.form.get(this.formName.FICHIER) as FormControl;
    this.formPeriode = this.form.get(this.formName.PERIODE) as FormControl;
  }

  isDateDisabled(): boolean {
    return !this.form.get('dateType').value;
  }

  /**
   * Search occurrence etape
   */
  searchOccurrenceEtape() {
    const formData = this.form?.getRawValue();
    this.sessionDataSearchService.updateDataSearchToSession(formData);
    const occurrenceEtapePayload = this.setOccurrenceEtapePayload(formData);

    this.subscriptions.push(
      this.apiGestionOccurrenceEtapeService
        .getOccurrenceEtapeData(occurrenceEtapePayload)
        .pipe(take(1))
        .subscribe(
          response => {
            const modalRef = this.modalService.open(GestionOccurrenceEtapeModalComponent);
            if (modalRef && modalRef.componentInstance) {
              modalRef.componentInstance.searchOccurrenceEtapeData = response.data.searchOccurrenceEtape;
            } else {
              console.error(`Échec de l'ouverture de la fenêtre modale ou modalRef est indéfini`);
              this.noteService.show({
                title: 'Une erreur est survenue',
                classname: 'note-erreur',
                body: `Échec de l'ouverture de la fenêtre modale ou modalRef est indéfini`,
                category: ToastCategoryEnum.ERROR,
              });
            }
          },
          error => {
            console.error('error', error);
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

  /**
   * Set occurrence etape payload
   * @param formData
   * @private
   */
  setOccurrenceEtapePayload(formData: any) {
    let { dateDebut, dateFin } = this.formatDateDebutFin(formData);
    let org = [];
    let organisme: string[] = [];
    let rawOrg = formData?.organisme;
    if (rawOrg) {
      SharedUtil.extractSelectedOrgs(rawOrg, organisme);
    }

    let payload = new GestionOccurrenceEtapePayloadModel();
    payload.codenv = formData?.environnement ? formData.environnement : null;
    payload.codorg = organisme.length > 0 ? organisme : null;
    payload.codapp = formData?.application ? formData.application : null;
    payload.percod = formData?.periode ? formData.periode : null;
    payload.codcom = formData?.commande ? formData.commande : null;
    payload.codfic = formData?.fichier ? formData.fichier : null;
    payload.codgam = formData?.gamme ? formData.gamme : null;
    payload.codsit = formData?.site ? formData.site : null;
    payload.codres = formData?.ressource ? formData.ressource : null;
    payload.codser = formData?.serveur ? formData.serveur : null;
    payload.typetp = formData?.etapeType ? formData.etapeType : null;
    payload.statut = formData?.statut ? formData.statut : null;
    payload.codver = formData?.verrou ? formData.verrou : null;
    payload.typdat = formData?.dateType ? formData.dateType : null;
    payload.datdeb = dateDebut;
    payload.datfin = dateFin;

    return payload;
  }

  /**
   * Format date debut and date fin
   */
  initOccurrenceEtapeOptions() {
    this.subscriptions.push(this.apiGestionOccurrenceEtapeService.getDistinctEnvOrgAppGenetp().pipe(take(1)).subscribe(
      response => {
        this.allOrgReg = response.data.allOrganismes;
        this.optionsVerrou = [...new Set(response.data.allVerrous.map(e => e.code))];
        this.optionsStatut = [
          ...new Set([
            { value: 'C', text: 'Créé' },
            { value: 'V', text: 'Validé' },
            { value: 'D', text: 'Débuté' },
            { value: 'T', text: 'Terminé' },
            { value: 'S', text: 'Suspendu' },
            { value: 'I', text: 'Invalidé' },
          ]),
        ].sort((a, b) => a.value.localeCompare(b.value));
        this.distinctCodenvCodorgCodapp = response.data.findDistinctCodenvCodorgCodapp;
        this.optionsEnv = [...new Set(this.distinctCodenvCodorgCodapp.map(e => e.codenv))];
        this.optionsApp = [...new Set(this.distinctCodenvCodorgCodapp.map(e => e.codapp).sort((a, b) => a.localeCompare(b)))];
        this.optionsDateType = TYPE_DATE;
      },
      error => {
        console.error('error', error);
        const errorMessage = error?.errors?.[0]?.message || 'Une erreur est survenue';
        this.noteService.show({
          title: 'Une erreur est survenue',
          classname: 'note-erreur',
          body: errorMessage,
          category: ToastCategoryEnum.ERROR,
        });
      }
    ));
  }
  onChangeEnvironnement(): void {
    this.subscriptions.push(this.formEnv.valueChanges.subscribe(() => {
      this.resetOptions();
      this.optionsApp = [];
      this.formApp.setValue('');

      const organismes = [...new Set(this.distinctCodenvCodorgCodapp.filter(e => e.codenv === this.formEnv.value).map(e => e.codorg))];
      const orgForm = this.formOrg;
      SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
      this.isOrgOptionsInitialized && this.onChangeOrganisme([]);
      this.isOrgOptionsInitialized = true;
    }));
  }

  /**
   * On change organisme
   * @param e
   */
  onChangeOrganisme(e): void {
    if (!this.distinctCodenvCodorgCodapp) {
      return;
    }
    this.resetOptions();
    this.optionsApp = [];
    this.formApp.setValue('');

    const org = Object.values(e).map((e1: any) => e1.title);
    if (org) {
      this.optionsApp = [
        ...new Set(
          this.distinctCodenvCodorgCodapp
            .filter(e2 => org.includes(e2.codorg))
            .map(e3 => e3.codapp)
            .sort((a, b) => a.localeCompare(b))
        ),
      ];
    }
  }

  /**
   * On change application
   */
  onChangeApplication(): void {
    this.subscriptions.push(this.formApp.valueChanges
      .pipe(
        switchMap(codapp => {
          this.selectedApp = codapp;
          const occurrenceEtapePayload = this.setOccurrenceEtapePayload(this.form.getRawValue());
          this.resetOptions();
          return !!occurrenceEtapePayload.codapp ? this.apiGestionOccurrenceEtapeService.getOccurrenceEtapeData(occurrenceEtapePayload) : of(null);
        })
      )
      .subscribe((response: any) => {
        if (!!response) {
          this.searchOccurrenceEtapeResponse = response.data.searchOccurrenceEtape;
          this.optionsPeriode = [
            ...new Set(
              this.searchOccurrenceEtapeResponse
                .filter(e => e.codapp === this.selectedApp)
                .map(e => e.percod)
                .sort((a, b) => b.localeCompare(a))
            ),
          ];

          this.optionsCommande = [
            ...new Set(
              this.searchOccurrenceEtapeResponse.filter(e => e.codapp === this.selectedApp && e.codcom !== null && e.codcom !== '').map(e => e.codcom)
            ),
          ];

          this.optionsGamme = [
            ...new Set(
              this.searchOccurrenceEtapeResponse.filter(e => e.codapp === this.selectedApp && e.codgam !== null && e.codgam !== '').map(e => e.codgam)
            ),
          ];

          this.optionsSite = [...new Set(this.searchOccurrenceEtapeResponse.map(e => e.codsit).filter(e => e !== null && e !== ''))];
          this.optionsRessource = [...new Set(this.searchOccurrenceEtapeResponse.map(e => e.codres).filter(e => e !== null && e !== ''))];
          this.optionsServeur = [...new Set(this.searchOccurrenceEtapeResponse.map(e => e.codser).filter(e => e !== null && e !== ''))];
          this.optionsEtapeType = [...new Set(this.searchOccurrenceEtapeResponse.map(e => e.typetp).filter(e => e !== null && e !== ''))];
        }
      }));
  }

  /**
   * Reset options
   * @private
   */
  private resetOptions() {
    this.optionsPeriode = [];
    this.formPeriode.setValue('');
    this.optionsCommande = [];
    this.formCom.setValue('');
    this.optionsGamme = [];
    this.form.get('gamme').setValue('');
    this.optionsSite = [];
    this.form.get('site').setValue('');
    this.optionsRessource = [];
    this.form.get('ressource').setValue('');
    this.optionsServeur = [];
    this.form.get('serveur').setValue('');
    this.optionsEtapeType = [];
    this.form.get('etapeType').setValue('');
    this.optionsFichier = [];
    this.formFic.setValue('');
  }

  /**
   * On change periode
   */
  onChangePeriode(): void {
    this.subscriptions.push(this.formPeriode.valueChanges.subscribe(percod => {
      const occurrenceEtapePayload = this.setOccurrenceEtapePayload(this.form.getRawValue());
      this.optionsCommande = [];
      this.formCom.setValue('');
      this.optionsFichier = [];
      this.formFic.setValue('');
      if (occurrenceEtapePayload.percod && this.searchOccurrenceEtapeResponse) {
        this.optionsCommande = [
          ...new Set(this.searchOccurrenceEtapeResponse.filter(e => e.percod === percod && e.codcom !== null && e.codcom !== '').map(e => e.codcom)),
        ];
      }
    }));
  }

  /**
   * On change commande
   */
  onChangeCommande(): void {
    this.subscriptions.push(this.formCom.valueChanges.subscribe(codcom => {
      const occurrenceEtapePayload = this.setOccurrenceEtapePayload(this.form.getRawValue());
      this.optionsFichier = [];
      this.formFic.setValue('');
      if (occurrenceEtapePayload.codcom && this.searchOccurrenceEtapeResponse) {
        this.optionsFichier = [
          ...new Set(this.searchOccurrenceEtapeResponse.filter(e => e.codcom === codcom && e.codfic !== null && e.codfic !== '').map(e => e.codfic)),
        ];
      }
    }));
  }

  /**
   * Format date debut and date fin
   * @param formData
   * @private
   */
  private formatDateDebutFin(formData: any) {
    let dateDebut = null;
    if (formData?.dateDebut) {
      const newDateDebut = new Date(Date.UTC(formData.dateDebut.year, formData.dateDebut.month - 1, formData.dateDebut.day));
      dateDebut = this.datePipe.transform(newDateDebut, 'dd/MM/yyyy');
    }
    let dateFin = null;
    if (formData?.dateFin) {
      const newDateFin = new Date(Date.UTC(formData.dateFin.year, formData.dateFin.month - 1, formData.dateFin.day));
      dateFin = this.datePipe.transform(newDateFin, 'dd/MM/yyyy');
    }
    return { dateDebut, dateFin };
  }
}
