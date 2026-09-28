import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Toast, ToastCategoryEnum, ToastContainer } from '../../services/notes.service';

@Component({
  selector: 'app-note-template',
  templateUrl: './note-template.component.html',
  standalone: false,
})
export class NoteTemplateComponent implements OnInit {
  @Input() toast: Toast;
  // eslint-disable-next-line
  @Output() close: EventEmitter<ToastContainer> = new EventEmitter<ToastContainer>();

  form: FormGroup;
  toastCategoryEnum: typeof ToastCategoryEnum = ToastCategoryEnum;
  closeIconColor = 'black';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Formulaire de la note
    if (this.toast.doNotDisplayCheckbox) {
      this.form = this.fb.group({
        doNotDisplay: [false, null],
      });
    }

    // Couleur de l'icône fermeture
    if (this.toast.category === this.toastCategoryEnum.SUCCESS) {
      this.closeIconColor = 'white';
    }
  }

  /**
   * Envoie un message au container parent lorsque la note est fermée
   * Renvoie l'information du formulaire concernant l'affichage de la note
   */
  closeToast(toast: Toast): void {
    this.close.emit({ toast, doNotDisplayAnymore: this.form?.getRawValue().doNotDisplay });
  }
}
