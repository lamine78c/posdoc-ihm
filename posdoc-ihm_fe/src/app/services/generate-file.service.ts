import { inject, Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';

import * as logo from './acoss-logo.service';
import { ColDef } from 'ag-grid-community';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { ONE_HUNDRED_THIRTY_THOUSAND } from '@app/shared/utils/Constants';
import { DateUtil } from '@app/shared/utils/DateUtil';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class GenerateFileService {
  private readonly modalService = inject(NgbModal);
  constructor() {
    // do nothing
  }

  private getToday(): string {
    return DateUtil.formatDateToStringDDMMYYYY(new Date());
  }

  private getTimestamp(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
  }

  private getFilename(title: string, extension: string): string {
    const cleanTitle = title.replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '').replace(/\s+/g, '_');
    return `${cleanTitle}_${this.getTimestamp()}.${extension}`;
  }

  public generatePDFFile(data: any[], headers: string[], title: string, params: any = {}) {
    const date = this.getToday();

    const columnWidths: any[] = [];
    let body: any[] = [];
    const headersFormatted: any[] = [];

    const widthValue = 'auto';
    const rowColor = '#E8FAFF';

    headers.forEach(e => {
      columnWidths.push(widthValue);
      headersFormatted.push({ text: e, fontSize: 14, bold: true, fillColor: rowColor, color: '#0085A3', style: 'tableHeader', alignment: 'center' });
    });

    if (params?.columnWidths != undefined) {
      params.columnWidths.forEach((value, index) => {
        columnWidths[index] = value;
      });
    }

    columnWidths[headers.length - 1] = '*';

    body.push(headersFormatted);

    let rowColorLast = rowColor;

    let nombreTotal = data.length;
    if (params?.nombreTotal != undefined) {
      // nombre précise dans param
      nombreTotal = params.nombreTotal;
    }

    let pageOrientation = 'portrait';
    if (params?.pageOrientation != undefined) {
      // Personnalise l'orientation de la page
      pageOrientation = params.pageOrientation;
    }
    if (params?.columnDefs != undefined) {
      // Formate les valeurs booléennes avec les label définies dans la définition de la colonne
      this.formatBooleanData(data, params.columnDefs);
    }

    data = data.map(r => {
      // switch la couleur de ligne avec detail inclus
      if (params?.withDetail != undefined) {
        if (r[0] !== null) {
          // nouvelle ligne(1ère colonne non null), il faut changer la couleur
          rowColorLast = rowColorLast === null ? rowColor : null;
        }
      } else {
        // switch la couleur de ligne selon ligne numéro paire/impaire
        rowColorLast = rowColorLast === null ? rowColor : null;
      }
      return r.map(c => {
        if (c !== null && typeof c === 'object') {
          c.fillColor = rowColorLast;
          return c;
        } else {
          return { text: c, fillColor: rowColorLast };
        }
      });
    });

    if (!!params.rowsPerPage) {
      // Ajout des lignes de données avec gestion des sauts de page
      let currentRowCount: number = 0;
      data.forEach((row, index) => {
        if (currentRowCount >= params.rowsPerPage) {
          body[index][0].pageBreak = 'after';
          currentRowCount = 0;
        }
        body.push(row);
        currentRowCount++;
      });
    } else {
      body = body.concat(data);
    }

    const subtitle = params?.subtitle || null;
    const isBilan = params?.isBilan || false;
    const autoPrint = params?.autoPrint || false;
    const pageSize = params?.pageSize || 'A3';
    const docDefinition = this.createPdfDefinition(body, columnWidths, date, title, nombreTotal, pageOrientation, subtitle, pageSize);

    const pdf = pdfMake.createPdf(docDefinition);

    if (isBilan) {
      // Pour les bilans : toujours imprimer ET télécharger
      pdf.print();
      setTimeout(() => {
        pdfMake.createPdf(docDefinition).download(this.getFilename(title, 'pdf'));
      }, 500);
    } else if (autoPrint) {
      pdf.print();
    } else {
      pdf.download(this.getFilename(title, 'pdf'));
    }
  }

  private createPdfDefinition(body: any[], columnWidths: any[], date: string, title: string, nombreTotal: number, pageOrientation: string, subtitle?: string, pageSize: string = 'A3') {
    const content: any[] = [
      {
        margin: [0, 30, 0, 0],
        text: title,
        alignment: 'center',
        bold: true,
        fontSize: 20,
        color: '#0085A3',
      },
    ];

    if (subtitle) {
      content.push({
        margin: [0, 5, 0, 0],
        text: subtitle,
        alignment: 'center',
        bold: true,
        fontSize: 14,
        color: '#0085A3',
      });
    }

    content.push(
      {
        text: 'Nombre de lignes: ' + nombreTotal,
        bold: true,
        alignment: 'left',
      },
      {
        margin: [0, 10, 0, 0],
        color: '#444',
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: columnWidths,
          body: body,
        },
        layout: {
          hLineWidth: function (i, node) {
            return 1;
          },
          vLineWidth: function (i, node) {
            return 1;
          },
          hLineColor: function (i, node) {
            return 'gray';
          },
          vLineColor: function (i, node) {
            return 'gray';
          },
        },
      }
    );

    return {
      pageSize: pageSize,
      pageOrientation: pageOrientation,
      header: function (currentPage) {
        if (currentPage > 1) return {};
        return {
          columns: [
            {
              // if you specify both width and height - image will be stretched
              margin: [5, 5, 5, 5],
              width: 150,
              height: 41,
              image: logo.imgLogoUrssafBase64,
              style: 'logo',
              border: false,
            },
            {
              margin: [0, 20, 40, 0],
              text: 'Date: ' + date,
              alignment: 'right',
              bold: true,
            },
          ],
          columnGap: 20,
        };
      },
      footer: function (currentPage, pageCount) {
        return { text: currentPage.toString() + '/' + pageCount, alignment: 'center', margin: [0, 0, 0, 0] };
      },
      content: content,
    };
  }

  public generateExcelFile(data: any[], headers: string[], title: string, params: any = {}) {
    const MAX_ROWS = ONE_HUNDRED_THIRTY_THOUSAND;

    if (data.length > MAX_ROWS) {
      const modalRef = this.modalService.open(PopupConfirmationComponent);
      modalRef.componentInstance.rowDataArray = ['Veuillez affiner votre recherche pour réduire le volume de données.'];
      modalRef.componentInstance.messages = [
        'Nombre de lignes trop important',
        `L'export Excel contient ${data.length} lignes, ce qui dépasse la limite maximale (${MAX_ROWS})`,
      ];

      modalRef.componentInstance.firstButton = null;
      modalRef.componentInstance.secondButton = { label: 'Abandonner', icone: 'icon-b_cancel' };
    } else {
      this.generateExcelContent(data, headers, title, params);
    }
  }

  private generateExcelContent(data: any[], headers: string[], title: string, params: any = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    this.addExcelLogo(workbook, worksheet);
    const letter = this.addExcelTitle(worksheet, headers, title);
    this.addExcelDateAndTotal(worksheet, letter, data.length, params);
    this.addExcelHeaders(worksheet, headers);

    if (params?.columnDefs != undefined) {
      this.formatBooleanData(data, params.columnDefs);
    }

    this.addExcelDataRows(worksheet, data, params);
    this.autoSizeExcelColumns(worksheet, params);

    worksheet.addRow([]);

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, this.getFilename(title, 'xlsx'));
    });
  }

  private addExcelLogo(workbook: any, worksheet: any): void {
    const myLogoImage = workbook.addImage({
      base64: logo.imgLogoUrssafBase64,
      extension: 'png',
    });

    worksheet.mergeCells('A1:C4');
    worksheet.addImage(myLogoImage, {
      tl: { col: 0.1, row: 1 },
      ext: { width: 150, height: 41 },
    });
  }

  private addExcelTitle(worksheet: any, headers: string[], title: string): string {
    const titleLength = headers.length;
    let letter = 'H';
    if (titleLength >= 26) {
      letter = 'Z';
    } else if (titleLength > 6) {
      letter = String.fromCharCode(titleLength + 'A'.charCodeAt(0) - 1);
    }

    worksheet.mergeCells('D1:' + letter + '3');
    const titleRow = worksheet.getCell('D1');
    titleRow.value = title;
    titleRow.font = {
      name: 'Calibri',
      size: 18,
      underline: 'false',
      bold: true,
      color: { argb: '0085A3' },
    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    return letter;
  }

  private addExcelDateAndTotal(worksheet: any, letter: string, dataLength: number, params: any): void {
    worksheet.mergeCells('D4:' + letter + '4');
    const date = this.getToday();

    const nombreTotal = params?.nombreTotal !== undefined ? params.nombreTotal : dataLength;
    const total = 'Nombre de lignes : ' + nombreTotal + '             Date: ' + date;
    const totalCell = worksheet.getCell(letter + '4');
    totalCell.value = total;
    totalCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true,
    };
  }

  private addExcelHeaders(worksheet: any, headers: string[]): void {
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4167B8' },
        bgColor: { argb: '' },
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' },
        size: 12,
      };
    });
  }

  private addExcelDataRows(worksheet: any, data: any[], params: any): void {
    data.forEach(d => {
      const row = worksheet.addRow(d);
      if (params?.action !== undefined && params.action === 'fgColor' && params.column !== undefined) {
        params.column.forEach(o => {
          if (o.index !== undefined && o.texte !== undefined && o.color !== undefined) {
            const actif = row.getCell(o.index);
            if (actif == o.texte) {
              actif.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: o.color },
              };
            }
          }
        });
      }
    });
  }

  private autoSizeExcelColumns(worksheet: any, params: any): void {
    worksheet.columns.forEach(column => {
      const lengths = column.values.filter(v => v != null).map(v => (v instanceof Date ? v.toDateString().length : v.toString().length));
      const maxLength = Math.max(...lengths.filter((v, i) => typeof v === 'number' && i > 4)) + 3;
      column.width = maxLength > 8 ? maxLength : 8;
      if (params?.numFmtDefs !== undefined) {
        params.numFmtDefs.filter(v => v.number === column.number).forEach(v => (column.numFmt = v.numFmt));
      }
    });
  }

  formatBooleanData(data: any[], columnDefs: any[]): void {
    const dataRef = columnDefs
      .map(c => ({
        field: c.field,
        possibleLabelWithValues: c.floatingFilterComponentParams?.possibleLabelWithValues,
      }))
      .filter(e => !!e.possibleLabelWithValues);

    !!dataRef &&
      data.forEach(d => {
        dataRef.forEach(dr => {
          const columnIndex: number = columnDefs.findIndex((columnDef: ColDef) => columnDef.field === dr.field);
          if (columnIndex !== -1) {
            d[columnIndex] = dr.possibleLabelWithValues.find(e => e.value == d[columnIndex])?.label;
          }
        });
      });
  }

  /**
   * Télécharge un PDF depuis une chaîne base64 et l'ouvre dans un nouvel onglet
   * (sans déclencher le dialogue d'impression)
   * @param pdfBase64 Le PDF encodé en base64
   * @param filename Le nom du fichier pour le téléchargement
   */
  public downloadPdfFromBase64(pdfBase64: string, filename: string = 'document.pdf'): void {
    if (!pdfBase64) {
      console.error('Aucun PDF base64 fourni');
      return;
    }

    try {
      const cleanBase64 = pdfBase64.replace(/\s/g, '');

      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes.buffer], { type: 'application/pdf' });

      FileSaver.saveAs(blob, filename);

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Erreur lors du traitement du PDF base64:', error);
    }
  }
}
