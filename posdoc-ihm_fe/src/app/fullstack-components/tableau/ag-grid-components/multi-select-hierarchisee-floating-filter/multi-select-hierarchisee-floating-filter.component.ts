import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { RowNode } from 'ag-grid-community';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multi-hierarchisee-select-floating-filter',
  templateUrl: './multi-select-hierarchisee-floating-filter.component.html',
  styleUrls: ['./multi-select-hierarchisee-floating-filter.component.scss'],
  standalone: false,
})
export class MultiSelectHierarchiseeFloatingFilterComponent {
  // @ViewChild('dropdownRef', {static: false, read: NgbDropdown}) dropdown: NgbDropdown;
  defaultText: string;

  //parametre de la cellule
  params;

  // formulaire du select
  form: FormGroup;

  //index pour le selectAll
  formIndex: number;

  subscriptions: Subscription[] = [];

  isDisabled = false;

  selectedItems = [];

  constructor(
    private fb: FormBuilder,
    private filterSharedDataService: FilterSharedDataService
  ) {
    this.filterSharedDataService.getData().subscribe(isDisabled => (this.isDisabled = isDisabled));
  }

  agInit(params): void {
    params.api.addEventListener('modelUpdated', this.modelUpddated.bind(this));

    this.params = params;
    this.formIndex = this.params?.formIndex;

    this.form = this.fb.group({});
  }

  filterChanged(changes) {
    let items = changes.map(e => e.title).map(e => (e === 'vide' ? null : e));
    this.selectedItems = items;
    items = items.length > 0 ? items : null;
    this.params.parentFilterInstance(instance => {
      instance.setModel({ values: items });
      this.params.api.onFilterChanged();
    });
  }

  modelUpddated() {
    const dataFromGrid = [];
    // le nom de la colonne
    const columName = this.params.column.colId;
    // on récupère tous elements après filtrage
    this.params.api.forEachNodeAfterFilter((node: RowNode) => {
      if (node.key == null) {
        dataFromGrid.push(node.data[columName]);
      }
    });
    // on récupère les elements unique
    const uniqueDataFromGrid = [...new Set(dataFromGrid)];
    // si possibleValues existe, liste hierachique
    if (this.params.selectData != null) {
      // liste total des organisque existatnt, avec leur régions
      let allOrganismes;
      // si les données brut n'existe pas, on s'inscrit pour les recevoir
      this.params.selectData!.subscribe(e => {
        allOrganismes = e;
        // si le filtre est activé, on coche les checkbox du formulaire
        const isFilter = this.selectedItems.length ? true : false;
        const orgs = uniqueDataFromGrid;
        this.form = SharedUtil.getOrgFormByOrgData(this.form, orgs, allOrganismes, isFilter);
      });
    }
  }
}
