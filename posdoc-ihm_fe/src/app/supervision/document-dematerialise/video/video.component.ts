import { LoginService } from '@acoss/prisme-angular-intranet';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { SearchDocVideoQuery } from '@app/models/payload/search-doc-dematerialise-video';
import { ApiAdelaideDocumentDematerialiseVideoService } from '@app/services/api-adelaide-docments-dematerialise-video.service';

import { DEFAULT_ENVIRONNEMENT, STATUT_DEBUT, STATUT_SUSPENDU, STATUT_TERMINE, TYPES } from '@app/shared/utils/Constants';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { DatePipe } from '@angular/common';
import { DocumentItem, DocumentsType } from '@app/models/documentType-interface';
import { DetailsComponent } from './modal/details/details.component';
import { DocumentVideoParamDataModel } from '@app/models/supervision/production/details/paramData-video-model';
import { DocumentVideo } from '@app/models/document-interface';
import { EnvironnementDocument } from '@app/models/environnement-document-interface';
import { Type } from '@app/models/type-interface';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-document-dematerialise-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class VideoComponent implements OnInit, OnDestroy {
  @Output() applySearchEvent = new EventEmitter<any>();
  @Input() isIntervalStart: boolean;
  overlayNoRowsTemplate: string;

  isStarted: boolean = false;

  form: FormGroup;
  listDocuments: DocumentVideo[] = [];

  listDocumentsD: DocumentItem[] = [];
  listDocumentsT: DocumentItem[] = [];
  listDocumentsS: DocumentItem[] = [];
  docType: DocumentsType[] = [];
  paramData: DocumentVideoParamDataModel;
  types: Type[] = [];

  private allDocuments: EnvironnementDocument[] = [];
  private formEnvSub?: Subscription;
  subscriptions: Subscription[] = [];
  // Gestion  de la partie démarrage/arret Video
  textStartStop = 'Démarrer';
  interval: any;

  optionsEnv: string[] = []; // Initialisation par défaut
  optionsDoc: string[] = [];
  optionsType = TYPES.map(type => `${type.label}`);
  fromMinDate: NgbDateStruct;
  toMaxDate: NgbDateStruct;
  toInitLister = false;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  formEnv: FormControl;
  formDoc: FormControl;
  formType: FormControl;

  searchDone = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private apiAdelaideDocumentDematerialiseVideoService: ApiAdelaideDocumentDematerialiseVideoService,
    private loginService: LoginService,
    private apiAdelaideFichierService: ApiAdelaideFichierService,
    private modalService: NgbModal
  ) {}

  getUtilisateur(): string {
    return this.loginService.getIdentifiantUtilisateur();
  }

  ngOnInit(): void {
    this.initializeFormControls();
    this.initForm();
    this.loadEnvironments().then(() => {
      this.lister();
    });
    this.subscribeToFormChanges();
    this.onEnvironnementChange(this.formEnv.value);
  }

  private initializeFormControls(): void {
    this.formEnv = new FormControl('');
    this.formDoc = new FormControl('');
    this.formType = new FormControl('');
  }

  private subscribeToFormChanges(): void {
    this.formEnvSub = this.formEnv.valueChanges.subscribe(value => {
      this.onEnvironnementChange(value);
    });
  }
  lister(): void {
    this.toInitLister = true;
    let query = this.getSearchDocVideoQuery();

    const dateObject = this.form.get('date').value;
    const currentDate = new Date(Date.UTC(dateObject.year, dateObject.month - 1, dateObject.day));

    query.datdem = this.datePipe.transform(currentDate.toISOString(), 'yyyy-MM-dd');

    query.codenv = this.formEnv.value || null;
    query.coddoc = this.formDoc.value || null;
    const selectedTypeLabel = this.formType.value;
    const selectedType = TYPES.find(type => type.label === selectedTypeLabel);
    query.typact = selectedType ? selectedType.value : null;

    this.subscriptions.push(
      this.apiAdelaideDocumentDematerialiseVideoService.getDocsDematerialisesVideo(query).pipe(take(1)).subscribe((data: any) => {
        this.listDocuments = data.data.getDocsDematerialisesVideo || [];

        // Limiter les résultats à 100 éléments
        this.listDocuments = this.listDocuments.slice(0, 100);

        this.listDocumentsD = this.filterDocumentsByStatus(STATUT_DEBUT);
        this.listDocumentsT = this.filterDocumentsByStatus(STATUT_TERMINE);
        this.listDocumentsS = this.filterDocumentsByStatus(STATUT_SUSPENDU);
        let maxLength = Math.max(this.listDocumentsD.length, this.listDocumentsT.length, this.listDocumentsS.length);

        this.docType = [];
        for (let i = 0; i < maxLength; i++) {
          const obj: DocumentsType = {
            documentTypeD: this.listDocumentsD[i],
            documentTypeT: this.listDocumentsT[i],
            documentTypeS: this.listDocumentsS[i],
          };

          this.docType.push(obj);
        }
      })
    );
    this.searchDone = true;
  }

  initForm(): void {
    const today = new Date();
    const todayNgbDateStruct: NgbDateStruct = {
      year: today.getUTCFullYear(),
      month: today.getUTCMonth() + 1,
      day: today.getUTCDate(),
    };

    this.form = this.fb.group({
      date: [todayNgbDateStruct],
      environnement: this.formEnv,
      document: this.formDoc,
      type: this.formType,
    });
  }

  onEnvironnementChange(env: string): void {
    const filteredDocs = this.allDocuments.filter(doc => doc.codeEnv === env).sort((a, b) => a.codeDoc.localeCompare(b.codeDoc)); // Tri alphabétique

    this.optionsDoc = filteredDocs.map(doc => doc.codeDoc);
  }

  loadEnvironments(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.apiAdelaideFichierService.getFichiersSearchByEnvironnement().pipe(take(1)).subscribe(
          (data: any) => {
            const environments = data.data.getFichiersSearchByEnvironnement.map(doc => doc.codeEnv);
            this.optionsEnv = Array.from(new Set(environments));
            this.allDocuments = data.data.getFichiersSearchByEnvironnement; // enregistrer la liste des documents
            if (this.optionsEnv.includes(DEFAULT_ENVIRONNEMENT)) {
              this.formEnv.setValue(DEFAULT_ENVIRONNEMENT);
            }
            resolve();
          },
          error => {
            reject(error);
          }
        )
      );
    });
  }

  getLabelForType(value: string): string {
    const type = TYPES.find(t => t.value === value);
    return type ? type.label : value;
  }

  getSearchDocVideoQuery(): SearchDocVideoQuery {
    return {
      datdem: null,
      docsta: null,
      codenv: null,
      coddoc: null,
      typact: null,
    };
  }

  filterDocumentsByStatus(status: string): any[] {
    return this.listDocuments?.filter(doc => doc.docsta === status) || [];
  }

  formatDocument(doc?: DocumentItem): string {
    if (!doc) return '';

    const parts = [doc.datdem, doc.numdem, doc.coddoc, doc.refdem, this.getLabelForType(doc.typact)].filter(part => part); // Filter out empty parts

    return parts.join('-');
  }

  public ListerConsultationVideo() {
    // Première consultation immédiate
    this.lister();
  }

  startStop() {
    const REFRESH_INTERVAL = 5000;
    if (this.interval) {
      // arrêter le video
      clearInterval(this.interval);
      this.textStartStop = 'Démarrer';
      this.interval = undefined;
      this.isIntervalStart = false;
    } else {
      // démarrer le video
      this.textStartStop = 'Arrêter';
      this.isIntervalStart = true;
      this.lister(); // lancer immédiatement la recherche
      this.interval = setInterval(() => {
        this.lister();
      }, REFRESH_INTERVAL);
    }
  }

  openPopup(doc?: DocumentItem) {
    if (doc) {
      this.paramData = new DocumentVideoParamDataModel();
      this.paramData.datdem = doc.datdem;
      this.paramData.numdem = doc.numdem;
      const modalRef = this.modalService.open(DetailsComponent);
      modalRef.componentInstance.modalRef = modalRef;
      modalRef.componentInstance.paramData = this.paramData;
    }
  }

  ngOnDestroy(): void {
    if (this.interval) {
      this.startStop()
    }
  }
}
