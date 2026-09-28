import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GenerateFileService } from './generate-file.service';
import pdfMake from 'pdfmake/build/pdfmake';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { DateUtil } from '@app/shared/utils/DateUtil';

describe('GenerateFileService', () => {
  let service: GenerateFileService;
  let modalService: jasmine.SpyObj<NgbModal>;

  beforeEach(() => {
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      providers: [GenerateFileService, { provide: NgbModal, useValue: modalServiceSpy }],
    });
    service = TestBed.inject(GenerateFileService);
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generatePDFFile', () => {
    let pdfMakeSpy: jasmine.Spy;
    let downloadSpy: jasmine.Spy;

    beforeEach(() => {
      downloadSpy = jasmine.createSpy('download');
      pdfMakeSpy = spyOn(pdfMake, 'createPdf').and.returnValue({
        download: downloadSpy,
      } as any);
    });

    it('should generate a PDF file with basic parameters', () => {
      const data = [
        ['value1', 'value2'],
        ['value3', 'value4'],
      ];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';

      service.generatePDFFile(data, headers, title);

      expect(pdfMakeSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Test_PDF_\d{8}-\d{6}\.pdf/));
    });

    it('should generate a PDF file with custom column widths', () => {
      const data = [['value1', 'value2']];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';
      const params = { columnWidths: [100, 200] };

      service.generatePDFFile(data, headers, title, params);

      expect(pdfMakeSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Test_PDF_\d{8}-\d{6}\.pdf/));
    });

    it('should generate a PDF file with custom orientation', () => {
      const data = [['value1', 'value2']];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';
      const params = { pageOrientation: 'landscape' };

      service.generatePDFFile(data, headers, title, params);

      expect(pdfMakeSpy).toHaveBeenCalled();
      const docDefinition = pdfMakeSpy.calls.mostRecent().args[0];
      expect(docDefinition.pageOrientation).toBe('landscape');
    });

    it('should generate a PDF file with custom total count', () => {
      const data = [['value1', 'value2']];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';
      const params = { nombreTotal: 100 };

      service.generatePDFFile(data, headers, title, params);

      expect(pdfMakeSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Test_PDF_\d{8}-\d{6}\.pdf/));
    });

    it('should format boolean data when columnDefs are provided', () => {
      const data = [['value1', true]];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';
      const columnDefs = [
        { field: 'field1' },
        {
          field: 'field2',
          floatingFilterComponentParams: {
            possibleLabelWithValues: [
              { value: true, label: 'Oui' },
              { value: false, label: 'Non' },
            ],
          },
        },
      ];
      const params = { columnDefs };

      service.generatePDFFile(data, headers, title, params);

      expect(pdfMakeSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Test_PDF_\d{8}-\d{6}\.pdf/));
    });

    it('should handle rows per page parameter', () => {
      const data = [
        ['row1', 'data1'],
        ['row2', 'data2'],
        ['row3', 'data3'],
      ];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';
      const params = { rowsPerPage: 2 };

      service.generatePDFFile(data, headers, title, params);

      expect(pdfMakeSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Test_PDF_\d{8}-\d{6}\.pdf/));
    });

    it('should handle withDetail parameter for alternating row colors', () => {
      const data = [
        ['value1', 'data1'],
        [null, 'data2'],
        ['value2', 'data3'],
      ];
      const headers = ['Header1', 'Header2'];
      const title = 'Test PDF';
      const params = { withDetail: true };

      service.generatePDFFile(data, headers, title, params);

      expect(pdfMakeSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Test_PDF_\d{8}-\d{6}\.pdf/));
    });
  });

  describe('generateExcelFile', () => {
    let fileSaverSpy: jasmine.Spy;

    beforeEach(() => {
      fileSaverSpy = spyOn(FileSaver, 'saveAs');
      spyOn(ExcelJS.Workbook.prototype, 'addWorksheet').and.returnValue({
        mergeCells: jasmine.createSpy('mergeCells'),
        addImage: jasmine.createSpy('addImage'),
        getCell: jasmine.createSpy('getCell').and.returnValue({
          value: '',
          font: {},
          alignment: {},
          fill: {},
        }),
        addRow: jasmine.createSpy('addRow').and.returnValue({
          eachCell: jasmine.createSpy('eachCell'),
          getCell: jasmine.createSpy('getCell').and.returnValue({
            fill: {},
          }),
        }),
        columns: [],
      } as any);
      spyOn(ExcelJS.Workbook.prototype, 'addImage').and.returnValue(0);
    });

    it('should generate an Excel file when data is within limit', () => {
      const data = [
        ['value1', 'value2'],
        ['value3', 'value4'],
      ];
      const headers = ['Header1', 'Header2'];
      const title = 'Test Excel';

      service.generateExcelFile(data, headers, title);

      expect(modalService.open).not.toHaveBeenCalled();
    });

    it('should show modal when data exceeds maximum rows', () => {
      const largeData = new Array(131000).fill(['value1', 'value2']);
      const headers = ['Header1', 'Header2'];
      const title = 'Test Excel';

      const modalRef = {
        componentInstance: {
          rowDataArray: [],
          messages: [],
          firstButton: null,
          secondButton: {},
        },
      };
      modalService.open.and.returnValue(modalRef as any);

      service.generateExcelFile(largeData, headers, title);

      expect(modalService.open).toHaveBeenCalled();
    });

    it('should generate an Excel file with custom total count', () => {
      const data = [['value1', 'value2']];
      const headers = ['Header1', 'Header2'];
      const title = 'Test Excel';
      const params = { nombreTotal: 100 };

      service.generateExcelFile(data, headers, title, params);

      expect(modalService.open).not.toHaveBeenCalled();
    });

    it('should format boolean data when columnDefs are provided', () => {
      const data = [['value1', true]];
      const headers = ['Header1', 'Header2'];
      const title = 'Test Excel';
      const columnDefs = [
        { field: 'field1' },
        {
          field: 'field2',
          floatingFilterComponentParams: {
            possibleLabelWithValues: [
              { value: true, label: 'Oui' },
              { value: false, label: 'Non' },
            ],
          },
        },
      ];
      const params = { columnDefs };

      service.generateExcelFile(data, headers, title, params);

      expect(modalService.open).not.toHaveBeenCalled();
    });

    it('should apply conditional formatting when action parameter is provided', () => {
      const data = [['value1', 'Actif']];
      const headers = ['Header1', 'Header2'];
      const title = 'Test Excel';
      const params = {
        action: 'fgColor',
        column: [{ index: 2, texte: 'Actif', color: 'FF00FF00' }],
      };

      service.generateExcelFile(data, headers, title, params);

      expect(modalService.open).not.toHaveBeenCalled();
    });

    it('should apply number format when numFmtDefs are provided', () => {
      const data = [['value1', 1234.56]];
      const headers = ['Header1', 'Header2'];
      const title = 'Test Excel';
      const params = {
        numFmtDefs: [{ number: 2, numFmt: '#,##0.00' }],
      };

      service.generateExcelFile(data, headers, title, params);

      expect(modalService.open).not.toHaveBeenCalled();
    });
  });

  describe('formatBooleanData', () => {
    it('should format boolean values based on columnDefs', () => {
      const data = [
        ['value1', true, false],
        ['value2', false, true],
      ];
      const columnDefs = [
        { field: 'field1' },
        {
          field: 'field2',
          floatingFilterComponentParams: {
            possibleLabelWithValues: [
              { value: true, label: 'Oui' },
              { value: false, label: 'Non' },
            ],
          },
        },
        {
          field: 'field3',
          floatingFilterComponentParams: {
            possibleLabelWithValues: [
              { value: true, label: 'Actif' },
              { value: false, label: 'Inactif' },
            ],
          },
        },
      ];

      service.formatBooleanData(data, columnDefs);

      expect(data[0][1]).toBe('Oui');
      expect(data[0][2]).toBe('Inactif');
      expect(data[1][1]).toBe('Non');
      expect(data[1][2]).toBe('Actif');
    });

    it('should not modify data when columnDefs have no possibleLabelWithValues', () => {
      const data = [['value1', true]];
      const columnDefs = [{ field: 'field1' }, { field: 'field2' }];

      service.formatBooleanData(data, columnDefs);

      expect(data[0][1]).toBe(true);
    });

    it('should handle empty columnDefs', () => {
      const data = [['value1', true]];
      const columnDefs = [];

      expect(() => service.formatBooleanData(data, columnDefs)).not.toThrow();
    });
  });
});
