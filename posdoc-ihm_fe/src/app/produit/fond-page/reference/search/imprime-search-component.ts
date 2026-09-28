import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-imprime-search-component',
  templateUrl: './imprime-search-component.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ImprimeSearchComponent implements OnInit, OnChanges {
  @Output() applyImprimesEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() reduireSearchEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() synchroniseReferenceList: any;

  environnementForm: UntypedFormGroup;

  formGroup: UntypedFormGroup = new UntypedFormGroup({});

  applications: any[] = [];
  references: any[] = [];

  searchList: { codeEnv: string; codeApp: string; refImp: string }[] = [];

  selectedEnvironnementCodeList: any[] = [];
  selectedApplicationCode: any;
  selectedReferenceCode: any;
  isLoadingOptions: boolean;

  selectedApplicationCodeLast: any;
  selectedReferenceCodeLast: any;

  subscriptions: Subscription[] = [];
  isSearchDisabled = false;

  private readonly fb = inject(UntypedFormBuilder);
  private readonly apiAdelaideFichierService = inject(ApiAdelaideFichierService);
  private readonly filterSharedDataService = inject(FilterSharedDataService);

  constructor() {
    // do nothing
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.synchroniseReferenceList && this.synchroniseReferenceList != undefined) {
      // ajoute this.synchroniseReferenceList.newReference dans searchList
      this.synchroniseReferenceList.environnementsUpdated.map(codeEnv => {
        const e2 = { codeEnv: codeEnv, codeApp: this.selectedApplicationCode, refImp: this.synchroniseReferenceList.newReference };
        let index = this.searchList.findIndex(e => JSON.stringify(e) === JSON.stringify(e2));
        if (index == -1) {
          // ajoute newReference dans la searchList
          this.searchList.push({ codeEnv: codeEnv, codeApp: this.selectedApplicationCode, refImp: this.synchroniseReferenceList.newReference });
        }
        if (this.synchroniseReferenceList.isListOfReferenceEmpty) {
          // supprime oldReference dans la searchList
          this.searchList = this.searchList.filter(
            e => !(e.codeEnv == codeEnv && e.codeApp == this.selectedApplicationCode && e.refImp == this.selectedReferenceCode)
          );
          this.selectedReferenceCode = undefined;
        }
      });
      this.searchList.sort((a, b) => a.refImp.localeCompare(b.refImp));
      this.synchroniseReferenceList && this.getReferences();
    }
  }

  ngOnInit(): void {
    this.initForms();
    this.getSearchElements();
    this.subscriptions.push(this.filterSharedDataService.getData().subscribe(isDisabled => (this.isSearchDisabled = isDisabled)));
  }

  getSearchElements(): void {
    this.subscriptions.push(
      this.apiAdelaideFichierService
        .getEnvAppRefImpEnGroup()
        .pipe(take(1))
        .subscribe((result: any) => {
          this.environnementForm = this.formGroup.get('environnement') as UntypedFormGroup;
          result.data.getFichiersSearchElements.map(r => {
            this.searchList.push({ codeEnv: r.codeEnv, codeApp: r.codeApp, refImp: r.refImprime });
            this.environnementForm.addControl(r.codeEnv, new FormControl(false, null));
          });
        })
    );
  }

  initForms(): void {
    this.formGroup = this.fb.group({
      environnement: this.fb.group({}, null),
      application: [this.selectedApplicationCode, null],
      reference: [this.selectedReferenceCode, null],
    });
  }

  onChangeEnvironnement(elementSelectedList: any) {
    this.selectedEnvironnementCodeList = elementSelectedList.map(e => e.title);
    this.getApplications();
    this.getReferences();
  }

  onChangeApplication(code) {
    this.selectedApplicationCode = code;
    this.selectedApplicationCodeLast = code;
    this.getReferences();
  }

  onChangeReference(code) {
    this.selectedReferenceCode = code;
    this.selectedReferenceCodeLast = code;
  }

  getApplications() {
    this.applications = [];
    this.selectedApplicationCode = undefined;
    if (this.selectedEnvironnementCodeList.length > 0) {
      this.searchList.forEach(e => {
        if (
          this.selectedEnvironnementCodeList.some(codeEnvSelected => e.codeEnv === codeEnvSelected) &&
          !this.applications.some(app => app.value === e.codeApp)
        ) {
          this.applications.push({ value: e.codeApp, text: e.codeApp });
        }
      });
      this.applications.sort((a, b) => a.text.localeCompare(b.text));
      // automatise les applications selectionnées la dernière fois
      if (!!this.selectedApplicationCodeLast && this.applications.some(e => e.value === this.selectedApplicationCodeLast)) {
        this.selectedApplicationCode = this.selectedApplicationCodeLast;
      }
    }
  }

  getReferences() {
    this.isLoadingOptions = true;
    this.references = [];
    this.selectedReferenceCode = undefined;
    if (this.selectedEnvironnementCodeList.length > 0 && !!this.selectedApplicationCode) {
      this.searchList.forEach(e => {
        if (
          this.selectedEnvironnementCodeList.some(codeEnvSelected => e.codeEnv == codeEnvSelected) &&
          this.selectedApplicationCode === e.codeApp &&
          !this.references.some(ref => ref.value === e.refImp)
        ) {
          this.references.push({ value: e.refImp, text: e.refImp });
        }
      });
      this.references.sort((a, b) => a.text.localeCompare(b.text));
      if (!!this.selectedReferenceCodeLast && this.references.some(e => e.value === this.selectedReferenceCodeLast)) {
        this.selectedReferenceCode = this.selectedReferenceCodeLast;
      }
    }
    this.isLoadingOptions = false;
  }

  getApplicationsControls() {
    if (!!this.selectedApplicationCode) {
      this.formGroup.patchValue({ application: this.selectedApplicationCode });
    }
    return this.formGroup.get('application');
  }

  getReferencesControls() {
    if (!!this.selectedReferenceCode) {
      this.formGroup.patchValue({ reference: this.selectedReferenceCode });
    }
    return this.formGroup.get('reference');
  }

  lister(event: any): void {
    this.applyImprimesEvent.emit({
      codesEnv: this.selectedEnvironnementCodeList,
      codesApp: [this.selectedApplicationCode],
      refsImp: [this.selectedReferenceCode],
    });
  }

  isSearchValid(): boolean {
    return (
      !!this.selectedEnvironnementCodeList.length &&
      !!this.selectedReferenceCode &&
      this.selectedReferenceCode.trim() != '0:' &&
      !!this.selectedApplicationCode &&
      this.selectedApplicationCode.trim() != '0:'
    );
  }
}
