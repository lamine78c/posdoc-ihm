import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { TableauDocumentDematerialiseService } from './tableau-document-dematerialise.service';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef } from 'ag-grid-community';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';

describe('TableauDocumentDematerialiseService', () => {
  let service: TableauDocumentDematerialiseService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;
  const mockColClearFilter = {
    headerName: 'Clear',
    field: 'clear',
    width: 50,
  };

  beforeEach(() => {
    mockTableauUtilService = jasmine.createSpyObj('TableauUtilService', ['getColClearFilter']);

    TestBed.configureTestingModule({
      providers: [DatePipe, { provide: TableauUtilService, useValue: mockTableauUtilService }],
    });

    mockTableauUtilService.getColClearFilter.and.returnValue(mockColClearFilter);
    service = TestBed.inject(TableauDocumentDematerialiseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows"><b>Veuillez remplir le formulaire pour sélectionner les documents à charger</b></span>');
  });

  it('should return all column definition', () => {
    const columnDefs = service.getColumnDefs();
    expect(columnDefs.length).toBe(19);

    const colenv = columnDefs.find((col: ColDef) => col.field === 'codenv') as ColDef;
    const colreg = columnDefs.find((col: ColDef) => col.field === 'codeRegion') as ColDef;
    const codorg = columnDefs.find((col: ColDef) => col.field === 'codorg') as ColDef;
    const codapp = columnDefs.find((col: ColDef) => col.field === 'codapp') as ColDef;
    const document = columnDefs.find((col: ColDef) => col.field === 'document') as ColDef;
    const typact = columnDefs.find((col: ColDef) => col.field === 'typact') as ColDef;

    expect(colenv.pinned).toEqual('left');
    expect(colreg.pinned).toEqual('left');
    expect(codorg.pinned).toEqual('left');
    expect(codapp.pinned).toEqual('left');
    expect(document.pinned).toEqual('left');
    expect(typact.pinned).toEqual('left');
  });

  it('test column id', () => {
    const columnDefs = service.getColumnDefs();
    const column = columnDefs.find((col: ColDef) => col.field === 'id') as ColDef;
    expect(column.pinned).toBe('left');
    expect(column.floatingFilterComponent).toEqual('inputFilter');

    const comparator = column.comparator as Function;
    let result = comparator('2025-112233', '2025-123456');
    expect(result).toBe(-1);
    result = comparator('2025-132233', '2025-123456');
    expect(result).toBe(1);
    result = comparator('2025-112233', '2026-123456');
    expect(result).toBe(-1);
    result = comparator('2025-132233', '2026-123456');
    expect(result).toBe(-1);
    result = comparator('2026-112233', '2025-123456');
    expect(result).toBe(1);
    result = comparator('2026-132233', '2025-123456');
    expect(result).toBe(1);
  });

  it('test column imprim', () => {
    const columnDefs = service.getColumnDefs();
    const column = columnDefs.find((col: ColDef) => col.field === 'imprim') as ColDef;
    expect(column.floatingFilterComponent).toBe('listFloatingFilter');
    expect(column.floatingFilterComponentParams).toEqual({
      possibleLabelWithValues: [
        { label: 'Vrai', value: true },
        { label: 'Faux', value: false },
      ],
      suppressFilterButton: true,
    });
    expect(column.cellRenderer).toBe(InterrupteurRadioComponent);
    expect(column.cellRendererParams).toEqual({
      formKey: 'imprim',
    });
  });

  it('test column ddodeb', () => {
    const columnDefs = service.getColumnDefs();
    const ddodeb = columnDefs.find((col: ColDef) => col.field === 'ddodeb') as ColDef;
    const valueFormatter = ddodeb.valueFormatter as Function;
    const result = valueFormatter({ data: { ddodeb: '2025-10-11 12:13:14' } });
    expect(result).toEqual('11/10/2025 12:13:14');
  });

  it('test column ddosus', () => {
    const columnDefs = service.getColumnDefs();
    const ddosus = columnDefs.find((col: ColDef) => col.field === 'ddosus') as ColDef;
    const valueFormatter = ddosus.valueFormatter as Function;
    const result = valueFormatter({ data: { ddosus: '2025-10-11 12:13:14' } });
    expect(result).toEqual('11/10/2025 12:13:14');
  });

  it('test column ddofin', () => {
    const columnDefs = service.getColumnDefs();
    const ddofin = columnDefs.find((col: ColDef) => col.field === 'ddofin') as ColDef;
    const valueFormatter = ddofin.valueFormatter as Function;
    const result = valueFormatter({ data: { ddofin: '2025-10-11 12:13:14' } });
    expect(result).toEqual('11/10/2025 12:13:14');
  });
});
