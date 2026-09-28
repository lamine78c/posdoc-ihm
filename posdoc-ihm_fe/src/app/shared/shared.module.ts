import { CdkScrollableModule, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatLineModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { FullstackComponentsModule } from '@app/fullstack-components/fullstack-components.module';
import { ResizableColumnDirective } from '@app/shared/directives/resizable-column.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { CheckboxHeaderComponent } from './components/checkbox/checkbox-header/checkbox-header.component';
import { InterrupteurSimpleComponent } from './components/interrupteur-simple/interrupteur-simple.component';
import {
  CommandesFichiersComponent,
  DetailsFacturationComponent,
  DetailsMassificationComponent,
  DetailsModalComponent,
  FichiersProduitsComponent,
  GeneralitesComponent,
  IncidentsComponent,
  NoticesComponent,
} from './components/modal';
import { MultiSelectSectionComponent } from './components/multi-select-section/multi-select-section.component';
import { SelectFromTableListComponent } from './components/select-from-table-list/select-from-table-list.component';
import { SingleListeHierarchiseFormComponent } from './components/single-select-hierarchise-list/single-liste-hierarchise-form/app-single-liste-hierarchise-form';
import { SingleSelectHierarchiseListComponent } from './components/single-select-hierarchise-list/single-select-hierarchise-list.component';
import { DateInputDirective } from './directives/date-input.directive';
import { NumberInputDirective } from './directives/number-input.directive';
import { PreselectionComponent } from './preselection/preselection.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { SelectListWithInputComponent } from './components/select-list-with-input/select-list-with-input.component';

@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    MatTabsModule,
    MatTreeModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    CdkScrollableModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    ReactiveFormsModule,
    MatLineModule,
    MatAutocompleteModule,
    FormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSidenavModule,
    ScrollingModule,
    MatSlideToggleModule,
    NgbModule,
    AgGridModule,
    FullstackComponentsModule,
    NgSelectModule,
  ],
  declarations: [
    NumberInputDirective,
    DateInputDirective,
    ResizableColumnDirective,
    SpinnerComponent,
    PreselectionComponent,
    SelectFromTableListComponent,
    SingleSelectHierarchiseListComponent,
    SingleListeHierarchiseFormComponent,
    MultiSelectSectionComponent,
    InterrupteurSimpleComponent,
    CheckboxHeaderComponent,
    DetailsModalComponent,
    GeneralitesComponent,
    CommandesFichiersComponent,
    FichiersProduitsComponent,
    NoticesComponent,
    DetailsFacturationComponent,
    DetailsMassificationComponent,
    IncidentsComponent,
    SelectListWithInputComponent,
  ],
  exports: [
    NumberInputDirective,
    DateInputDirective,
    ResizableColumnDirective,
    MatExpansionModule,
    MatTabsModule,
    MatTreeModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    CdkScrollableModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    ReactiveFormsModule,
    MatLineModule,
    MatAutocompleteModule,
    FormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSidenavModule,
    ScrollingModule,
    MatSlideToggleModule,
    NgbModule,
    AgGridModule,
    FullstackComponentsModule,
    NgSelectModule,
    SpinnerComponent,
    PreselectionComponent,
    SelectFromTableListComponent,
    SingleSelectHierarchiseListComponent,
    SingleListeHierarchiseFormComponent,
    MultiSelectSectionComponent,
    InterrupteurSimpleComponent,
    DetailsModalComponent,
    GeneralitesComponent,
    CommandesFichiersComponent,
    FichiersProduitsComponent,
    NoticesComponent,
    DetailsFacturationComponent,
    DetailsMassificationComponent,
    IncidentsComponent,
    SelectListWithInputComponent,
  ],
})
export class SharedModule {}
