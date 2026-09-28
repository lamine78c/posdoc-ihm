import { TestBed } from '@angular/core/testing';

import { TableauCompareCommandeService } from './tableau-compare-commande.service';

describe('TableauCompareCommandeService', () => {
  let service: TableauCompareCommandeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableauCompareCommandeService],
    }).compileComponents();
    service = TestBed.inject(TableauCompareCommandeService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return all columns', () => {
    const columnDefs = service.getColumnDefs();
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(4);
  });
});
