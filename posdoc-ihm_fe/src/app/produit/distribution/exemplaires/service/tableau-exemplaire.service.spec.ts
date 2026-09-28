import { TestBed } from '@angular/core/testing';

import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { TableauExemplaireService } from './tableau-exemplaire.service';
import { ColDef } from 'ag-grid-community';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';

describe('TableauExemplaireService', () => {
  let service: TableauExemplaireService;
  let mockTableauUtilService: TableauUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauExemplaireService);
    mockTableauUtilService = TestBed.inject(TableauUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all column definition', () => {
    spyOn(mockTableauUtilService, 'getColClearFilter').and.returnValue({ col: 'action' } as ExtendedColDef);
    const columnDefs = service.getColumnDefs();
    expect(columnDefs.length).toBe(16);

    const codenv = columnDefs.find((col: ColDef) => col.field === 'codenv') as ColDef;
    const codreg = columnDefs.find((col: ColDef) => col.field === 'codreg') as ColDef;
    const codorg = columnDefs.find((col: ColDef) => col.field === 'codorg') as ColDef;
    const codapp = columnDefs.find((col: ColDef) => col.field === 'codapp') as ColDef;
    const codcom = columnDefs.find((col: ColDef) => col.field === 'codcom') as ColDef;
    const codprd = columnDefs.find((col: ColDef) => col.field === 'codeProd') as ColDef;
    const codfic = columnDefs.find((col: ColDef) => col.field === 'codfic') as ColDef;
    const libfic = columnDefs.find((col: ColDef) => col.field === 'libFichier') as ColDef;
    const refimp = columnDefs.find((col: ColDef) => col.field === 'refImprime') as ColDef;
    const codgam = columnDefs.find((col: ColDef) => col.field === 'codgam') as ColDef;
    const codsit = columnDefs.find((col: ColDef) => col.field === 'codsit') as ColDef;
    const codres = columnDefs.find((col: ColDef) => col.field === 'codres') as ColDef;
    const nbrexe = columnDefs.find((col: ColDef) => col.field === 'nbrexe') as ColDef;
    const coddes = columnDefs.find((col: ColDef) => col.field === 'coddes') as ColDef;
    const exeact = columnDefs.find((col: ColDef) => col.field === 'exeact') as ColDef;

    expect(codenv.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codreg.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(coddes.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codcom.floatingFilterComponent).toBe('inputFilter');
    expect(codprd.floatingFilterComponent).toBe('inputFilter');
    expect(codfic.floatingFilterComponent).toBe('inputFilter');
    expect(libfic.floatingFilterComponent).toBe('inputFilter');
    expect(refimp.floatingFilterComponent).toBe('inputFilter');
    expect(codgam.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codsit.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codres.floatingFilterComponent).toBe('multiSelectFloatingFilter');
    expect(codorg.floatingFilterComponent).toBe('multiSelectHierarchiseeFloatingFilter');
    expect(codorg.floatingFilterComponentParams).toEqual({
      possibleValues: [],
    });
    expect(nbrexe.floatingFilterComponent).toBe('inputFilter');
    expect(nbrexe.cellStyle).toEqual({ 'justify-content': 'flex-end' });
    expect(exeact.floatingFilterComponent).toBe('listFloatingFilter');
    expect(exeact.floatingFilterComponentParams).toEqual({
      possibleLabelWithValues: [
        { label: 'Vrai', value: true },
        { label: 'Faux', value: false },
      ],
      suppressFilterButton: true,
    });
    expect(exeact.cellRenderer).toEqual(InterrupteurRadioComponent);
    expect(exeact.cellRendererParams).toEqual({
      formKey: 'exeact',
    });
  });

  it('should return template no rows', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toEqual('<span class="no-rows">Aucun résultat</span>');
  });
});
