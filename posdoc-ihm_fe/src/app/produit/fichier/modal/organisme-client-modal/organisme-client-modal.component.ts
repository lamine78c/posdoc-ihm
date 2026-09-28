import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-organisme-client-modal',
  templateUrl: './organisme-client-modal.component.html',
  styleUrl: './organisme-client-modal.component.scss',
  standalone: false,
})
export class OrganismeClientModalComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() title = '';
  @Input() clientOptions = [];
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };
  @Input() organismesSansRegionSelected = [];
  @Input() values = {};
  @Output() passEntry = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  private activeModal = inject(NgbActiveModal);
  form: FormGroup;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.form = this.fb.group({});
    if (this.organismesSansRegionSelected.length > 0) {
      this.organismesSansRegionSelected.forEach(org => {
        const value = this.values[org] || null;
        this.form.addControl(org, new FormControl(value, CustomValidators.required()));
      });
    }
  }

  isFormValid() {
    return this.form.valid;
  }

  passBack() {
    this.passEntry.emit({ formOrganismeClientValue: this.form.getRawValue() });
    this.closePopup();
  }

  closePopup() {
    this.activeModal.close();
  }
}
