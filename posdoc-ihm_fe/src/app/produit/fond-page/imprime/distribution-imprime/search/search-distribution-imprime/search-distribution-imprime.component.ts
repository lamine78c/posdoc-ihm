import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-distribution-imprime',
  templateUrl: './search-distribution-imprime.component.html',
  standalone: false,
})
export class SearchDistributionImprimeComponent implements OnInit {
  @Output() applySearchEvent = new EventEmitter<string>();

  form: FormGroup;
  filterForm: FormControl;

  private readonly fb: FormBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      filtre: [''],
    });

    this.filterForm = this.form.get('filtre') as FormControl;
  }

  lister() {
    const filterValue: string = this.filterForm.getRawValue();
    this.applySearchEvent.emit(filterValue);
  }
}
