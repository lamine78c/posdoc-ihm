import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-imprime.component.html',
  styleUrls: ['./modal-imprime.component.scss'],
  standalone: false,
})
export class ModalImprimeComponent implements OnInit {
  /**   * Titre de la popup   */
  @Input() title: string;
  /**   * Label et icône du premier bouton (En partant de la droite)   * Champ optionnel, sera affiché par défaut "Confirmer"   */
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  /**   * Label et icône du premier bouton (En partant de la droite)   * Champ optionnel, sera affiché par défaut "Abandonner"   */
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };

  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Output() passEntry = new EventEmitter<any>();
  @Input() imprimeSelected: string;
  @Input() imprimes!: any[];

  isFormValid = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private filterSharedDataService: FilterSharedDataService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      imprime: [this.imprimeSelected, CustomValidators.required()],
    });
  }

  apply(): void {
    this.passEntry.emit(this.form.get('imprime').value);
  }

  onChange(event) {
    if (this.form.valid && this.imprimeSelected !== this.form.get('imprime').value) {
      this.isFormValid = true;
    } else {
      this.isFormValid = false;
    }
  }

  closePopup() {
    this.modalRef.close();
  }

  ngOnDestroy(): void {
    this.filterSharedDataService.updateData(false);
  }
}
