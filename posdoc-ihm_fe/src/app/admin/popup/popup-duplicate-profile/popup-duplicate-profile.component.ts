import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup-duplicate-profile',
  templateUrl: './popup-duplicate-profile.component.html',
  standalone: false,
})
export class PopupDuplicateProfileComponent implements OnInit {
  form: FormGroup;

  @Input() profile: string;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nouveauCodeProfile: ['', Validators.required],
      nouveauLibelleProfile: ['', Validators.required],
    });
  }

  save() {
    this.activeModal.close(this.form.getRawValue());
  }
}
