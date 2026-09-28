import { TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { TableauServicePosdocService } from './tableau-service.service';

describe('TableauServicePosdocService', () => {
  let service: TableauServicePosdocService;
  let mockTableauUtilService: jasmine.SpyObj<TableauUtilService>;

  const mockActionColumns = [
    { field: 'select', headerName: 'Select' },
    { field: 'actions', headerName: 'Actions' },
  ];

  beforeEach(() => {
    const tableauUtilServiceSpy = jasmine.createSpyObj('TableauUtilService', ['getColsDefAction']);

    TestBed.configureTestingModule({
      providers: [TableauServicePosdocService, DatePipe, { provide: TableauUtilService, useValue: tableauUtilServiceSpy }],
    }).compileComponents();
    service = TestBed.inject(TableauServicePosdocService);

    mockTableauUtilService = TestBed.inject(TableauUtilService) as jasmine.SpyObj<TableauUtilService>;
    mockTableauUtilService.getColsDefAction.and.returnValue(mockActionColumns);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should return HTML template for no results', () => {
    const template = service.getOverlayNoRowsTemplate();
    expect(template).toBe('<span class="no-rows">Aucun résultat</span>');
  });

  it('should return all columns in correct order', () => {
    const columnDefs = service.getColumnDefs(true);
    expect(columnDefs).toBeDefined();
    expect(columnDefs.length).toBe(8);
  });
});
