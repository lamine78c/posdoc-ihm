import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-liste-autocomplete',
  templateUrl: './liste-autocomplete.component.html',
  standalone: false,
})
// TODO : à vérifier si le componsant est utilisable sinon supprime-le
export class ListeAutocompleteComponent {
  myControl = new FormControl();
  options: string[] = ['Option 1', 'Option 2', 'Option 3'];
  filteredOptions: Observable<string[]>;

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
