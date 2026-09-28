import { Component } from '@angular/core';
import { IFloatingFilterParams, IFloatingFilter, TextFilterModel } from 'ag-grid-community';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { FormGroup, FormControl } from '@angular/forms';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';

export interface ListFloatingFilterChange {
  model: TextFilterModel;
}

export interface ListFloatingFilterParams extends IFloatingFilterParams {
  possibleLabelWithValues: any[];
  possibleValues: any[];
  parent: any;
}

@Component({
  selector: 'app-list-floating-filter',
  templateUrl: './list-floating-filter.component.html',
  styleUrls: ['./list-floating-filter.component.scss'],
  standalone: false,
})
export class ListFloatingFilterComponent implements IFloatingFilter, AgFrameworkComponent<ListFloatingFilterParams> {
  private params: ListFloatingFilterParams;
  public possibleValues: string[];
  public possibleLabelWithValues: any[];
  public parent: any;
  isDisabled: boolean = false;

  listFilterForm: FormGroup;

  constructor(private filterSharedDataService: FilterSharedDataService) {
    this.filterSharedDataService.getData().subscribe(isDisabled => (this.isDisabled = isDisabled));
  }

  agInit(params: ListFloatingFilterParams): void {
    this.params = params;
    if (!!this.params.possibleLabelWithValues) {
      this.possibleLabelWithValues = this.params.possibleLabelWithValues;
    }
    if (this.params.possibleValues?.length) {
      this.possibleValues = this.params.possibleValues;
    } else {
      this.possibleValues = this.params.column.getUserProvidedColDef().cellRendererParams?.values;
    }
    const initialeValue = this.params.currentParentModel() ? this.params.currentParentModel().filter : '';

    this.listFilterForm = new FormGroup({
      selectedValueFormControl: new FormControl(initialeValue),
    });
  }

  valueSelected() {
    const value = this.listFilterForm.value.selectedValueFormControl;
    this.params.parentFilterInstance(instance => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }

  /**
   * Met à jour le formulaire avec la nouvelle valeur
   */
  onParentModelChanged(parentModel: any): void {
    this.listFilterForm.get('selectedValueFormControl').setValue(parentModel ? parentModel.filter : '');
  }
}
