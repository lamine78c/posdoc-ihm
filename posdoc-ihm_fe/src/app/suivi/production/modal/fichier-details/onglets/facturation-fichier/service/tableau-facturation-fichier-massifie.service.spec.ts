import { TestBed } from '@angular/core/testing';

import { ColDef } from 'ag-grid-community';
import { TableauFacturationFichierMassifieService } from './tableau-facturation-fichier-massifie.service';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('TableauFacturationFichierMassifieService', () => {
  let service: TableauFacturationFichierMassifieService;

  const mockData = {
    data: {
      codenv: 'P',
      codorg: '117',
      codapp: 'SNV2',
      percod: '251111-01',
      codcom: 'COM1',
      codfic: 'FIC1',
      numcom: 'NUM1',
      libtar: 'LIBELLE',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauFacturationFichierMassifieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all column definition', () => {
    const columnDefs = service.getColumnDefs();
    expect(columnDefs.length).toBe(6);

    const plus = columnDefs.find((col: ColDef) => col.field === 'plus') as any;
    const application = columnDefs.find((col: ColDef) => col.field === 'application') as ColDef;
    const percod = columnDefs.find((col: ColDef) => col.field === 'percod') as ColDef;
    const nbplis = columnDefs.find((col: ColDef) => col.field === 'nbplis') as ColDef;
    const coutot = columnDefs.find((col: ColDef) => col.field === 'coutot') as ColDef;
    const fichier = columnDefs.find((col: ColDef) => col.field === 'fichier') as ColDef;

    expect(plus.enableCollapsing).toBeTruthy();
    expect(plus.rowGroup).toBeTruthy();
    expect(plus.hide).toBeTruthy();
    expect(plus.lockPosition).toBe('left');
    expect(plus.valueGetter).toBeDefined();
    expect(application.floatingFilterComponent).toBe('inputFilter');
    expect(application.valueGetter).toBeDefined();
    expect(application.filterValueGetter).toBeDefined();
    expect(percod.floatingFilterComponent).toBe('inputFilter');
    expect(percod.valueGetter).toBeDefined();
    expect(percod.filterValueGetter).toBeDefined();
    expect(fichier.floatingFilterComponent).toBe('inputFilter');
    expect(fichier.valueGetter).toBeDefined();
    expect(fichier.filterValueGetter).toBeDefined();
    expect(nbplis.aggFunc).toBe('sum');
    expect(coutot.aggFunc).toBe('sum');
  });

  it('should return template no rows', () => {
    const result = service.getOverlayNoRowsTemplate();
    expect(result).toEqual('<span class="no-rows">Aucun fichier massifié</span>');
  });

  it('should format plus column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const plus = columnDefs.find(col => col.field === 'plus');

    expect(typeof plus.valueGetter).toBe('function');
    const result = (plus.valueGetter as any)(mockData);
    expect(result).toBe('P-117-SNV2-251111-01-COM1-FIC1-NUM1');
  });

  it('should format application column value correctly', () => {
    spyOn(SharedUtil, 'getGroupedFieldsAllConcat');
    const columnDefs = service.getColumnDefs() as ColDef[];
    const application = columnDefs.find(col => col.field === 'application');

    expect(typeof application.valueGetter).toBe('function');
    (application.valueGetter as any)(mockData);
    expect(SharedUtil.getGroupedFieldsAllConcat).toHaveBeenCalled();
  });

  it('should filter application column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const application = columnDefs.find(col => col.field === 'application');

    expect(typeof application.filterValueGetter).toBe('function');
    const result = (application.filterValueGetter as any)(mockData);
    expect(result).toBe('P117SNV2');
  });

  it('should format percod column value correctly', () => {
    spyOn(SharedUtil, 'getGroupedFields');
    const columnDefs = service.getColumnDefs() as ColDef[];
    const percod = columnDefs.find(col => col.field === 'percod');

    expect(typeof percod.valueGetter).toBe('function');
    (percod.valueGetter as any)(mockData);
    expect(SharedUtil.getGroupedFields).toHaveBeenCalled();
  });

  it('should filter percod column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const percod = columnDefs.find(col => col.field === 'percod');

    expect(typeof percod.filterValueGetter).toBe('function');
    const result = (percod.filterValueGetter as any)(mockData);
    expect(result).toBe('251111-01');
  });

  it('should format fichier column value correctly', () => {
    spyOn(SharedUtil, 'getGroupedFieldsAllConcat');
    const columnDefs = service.getColumnDefs() as ColDef[];
    const fichier = columnDefs.find(col => col.field === 'fichier');

    expect(typeof fichier.valueGetter).toBe('function');
    (fichier.valueGetter as any)(mockData);
    expect(SharedUtil.getGroupedFieldsAllConcat).toHaveBeenCalled();
  });

  it('should filter fichier column value correctly', () => {
    const columnDefs = service.getColumnDefs() as ColDef[];
    const fichier = columnDefs.find(col => col.field === 'fichier');

    expect(typeof fichier.filterValueGetter).toBe('function');
    const result = (fichier.filterValueGetter as any)(mockData);
    expect(result).toBe('COM1FIC1NUM1LIBELLE');
  });
});
