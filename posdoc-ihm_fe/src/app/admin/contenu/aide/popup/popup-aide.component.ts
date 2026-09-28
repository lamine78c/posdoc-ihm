import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { QUILL_DEFAULT_MODULES } from '@app/shared/config/quill-editor.config';

@Component({
  selector: 'app-popup-aide',
  templateUrl: './popup-aide.component.html',
  styleUrls: ['./popup-aide.component.scss'],
  standalone: false,
})
export class PopupAideComponent implements OnInit {
  form: FormGroup;
  modalRef: NgbModalRef;
  labelWidth = '9.929rem';

  @Input() id: number;
  @Input() path = '';
  @Input() message = '';

  pathOptions: { value: string; text: string }[] = [];

  // Configuration de Quill Editor partagée
  quillModules = QUILL_DEFAULT_MODULES;

  private readonly apiAdelaideContenuService = inject(ApiAdelaideContenuService);
  private readonly fb = inject(FormBuilder);

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.loadPathOptions();
    this.initForm();
  }

  private loadPathOptions() {
    this.apiAdelaideContenuService.getAllPathComplet().subscribe((result) => {
      this.pathOptions = result.data.getAllPathComplet.map((item: any) => ({
        value: item.path,
        text: item.libelle,
      }));
    });
  }

  private initForm() {
    this.form = this.fb.group({
      path: [this.path, CustomValidators.required()],
      message: [this.message, CustomValidators.required()],
    });
  }

  save() {
    const data = this.form.getRawValue();
    if (this.id) {
      data.id = this.id;
    }
    this.activeModal.close(data);
  }
}
