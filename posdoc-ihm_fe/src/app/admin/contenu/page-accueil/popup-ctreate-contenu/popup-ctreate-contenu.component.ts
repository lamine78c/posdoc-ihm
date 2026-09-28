import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbCalendar, NgbDate, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {QUILL_DEFAULT_MODULES} from "@app/shared/config/quill-editor.config";

@Component({
  selector: 'app-popup-ctreate-contenu',
  templateUrl: './popup-ctreate-contenu.component.html',
  styleUrls: ['./popup-ctreate-contenu.component.scss'],
  standalone: false,
})
export class PopupCtreateContenuComponent implements OnInit {
  form: FormGroup;
  modalRef: NgbModalRef;
  labelWidth = '9.929rem';

  @Input() titre = '';

  @Input() message = '';

  @Input() regions: string[] = [];

  @Input() listRegion: string[] = [];

  @Input() dateActivation;
  @Input() dateExpiration;

  calendar = inject(NgbCalendar);
  protected readonly quillModules = QUILL_DEFAULT_MODULES;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // initialisation des date selon modification ou creation
    // si creation, date activation aujourd'hui, et expiration dans un mois
    let fromDate, toDate;
    if (this.dateActivation) {
      const dd = new Date(this.dateActivation);
      fromDate = new NgbDate(dd.getFullYear(), dd.getMonth() + 1, dd.getDate());
      const df = new Date(this.dateExpiration);
      toDate = new NgbDate(df.getFullYear(), df.getMonth() + 1, df.getDate());
    } else {
      fromDate = this.calendar.getToday();
      toDate = this.calendar.getNext(fromDate, 'm');
    }

    // Création du formulaire de la popup
    const regionsControl = this.fb.group({});
    this.listRegion.forEach(e => {
      regionsControl.addControl(e, new FormControl(''));
      if (this.regions.includes(e)) {
        regionsControl.get(e).patchValue(true);
      }
    });
    this.form = this.fb.group({
      titre: [this.titre, [CustomValidators.required(), CustomValidators.lenghtMaxValidation(50)]],
      message: [this.message, CustomValidators.required()],
      dateActivation: [fromDate, CustomValidators.required()],
      dateExpiration: [toDate, CustomValidators.required()],
      regions: regionsControl,
    });
  }

  save() {
    const data = this.form.getRawValue();
    data.dateActivation = new Date(data.dateActivation.year, data.dateActivation.month - 1, data.dateActivation.day);
    data.dateExpiration = new Date(data.dateExpiration.year, data.dateExpiration.month - 1, data.dateExpiration.day);
    this.activeModal.close(data);
  }
}
