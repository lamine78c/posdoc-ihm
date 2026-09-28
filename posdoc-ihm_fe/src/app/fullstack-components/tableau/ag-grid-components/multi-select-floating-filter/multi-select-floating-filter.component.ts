import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-multi-select-floating-filter',
  templateUrl: './multi-select-floating-filter.component.html',
  styleUrls: ['./multi-select-floating-filter.component.scss'],
  standalone: false,
})
export class MultiSelectFloatingFilterComponent implements OnInit {
  form: FormGroup;

  formIndex: number;

  //parametre de la cellule
  params: any;

  selectedItems = [];

  isRessourceCustomSort = false;

  isFormatDDMMYYYYCustomSort = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({});
  }

  agInit(params: any): void {
    params.api.addEventListener('modelUpdated', this.modelUpddated.bind(this));
    this.params = params;
    this.isRessourceCustomSort = this.params?.isRessourceCustomSort;
    this.isFormatDDMMYYYYCustomSort = this.params?.isFormatDDMMYYYYCustomSort;
    this.formIndex = this.params?.formIndex;
  }

  filterChanged(event) {
    let items = event.map(e => e.title);
    this.selectedItems = items;
    if (items.includes('vide')) {
      this.selectedItems.push(null);
    }
    items = items.length > 0 ? items : null;
    this.params.parentFilterInstance(instance => {
      instance.setModel({ values: items });
      this.params.api.onFilterChanged();
    });
  }

  modelUpddated() {
    let dataFromGrid = [];
    let columName = this.params.column.colId;
    // on récupère toutes les lignes après filtrage
    this.params.api.forEachNodeAfterFilter(node => {
      if (node.key == null) {
        const columnDef = this.params.column.getColDef();
        if (columnDef.filterValueGetter) {
          const value = columnDef.filterValueGetter({
            data: node.data,
            node: node,
            colDef: columnDef,
            api: this.params.api,
            column: this.params.column,
          });
          dataFromGrid.push(value);
        } else if (columnDef.valueGetter) {
          // Si un valueGetter existe, l'utiliser dans les filtres
          const value = columnDef.valueGetter({
            data: node.data,
            node: node,
            colDef: columnDef,
            api: this.params.api,
            column: this.params.column,
          });
          dataFromGrid.push(value);
        } else {
          // Sinon utiliser la valeur directe du champ
          dataFromGrid.push(node.data[columName]);
        }
      }
    });
    dataFromGrid = [...new Set(dataFromGrid.flat(1))];
    dataFromGrid = [...new Set(dataFromGrid)].map(e => (e ? e : 'vide'));
    let f = dataFromGrid.reduce((accumulator, currentValue) => {
      accumulator[currentValue] = [this.selectedItems.includes(currentValue), null];
      return accumulator;
    }, {});
    this.form = this.fb.group(f, { emitEvent: false });
  }

  getFormGroup() {
    if (!!!Object.keys(this.form.controls).length) {
      this.modelUpddated();
    }
    return this.form;
  }
}
