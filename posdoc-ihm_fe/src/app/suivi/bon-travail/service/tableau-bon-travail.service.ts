import { Injectable } from '@angular/core';
import { CreationBonTravailManuelModalComponent } from '@app/exploitation-editique/bon-travail-manuel/modal/creation-bon-travail-manuel-modal/creation-bon-travail-manuel-modal.component';
import { CustomTooltipComponent } from '@app/fullstack-components/tableau/ag-grid-components/custom-tooltip/custom-tooltip.component';
import { DateEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/date-editor/date-editor.component';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { IsBonTravailManuelInputInterface } from '@app/models/exploitation-editique/bon-travail/is-bon-travail-manuel-input-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { ApiBonTravailService } from '@app/services/api-adelaide/exploitation-editique/bon-travail/api-bon-travail.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { FormatUtil } from '@app/shared/utils/FormatUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ITooltipParams } from 'ag-grid-community';
import { iif, of, Observable, Subscription } from 'rxjs';
import { map, switchMap, catchError, take } from 'rxjs/operators';
import { PdfInput } from '../models/pdf-input.interface';

type ColType = ColDef | ColGroupDef;
@Injectable({
  providedIn: 'root',
})
@AutoUnsubscribe
export class TableauBonTravailService {
  private static readonly ERROR_PDF_DOWNLOAD_DEFAULT = 'Erreur lors du téléchargement du bon de travail PDF';
  private static readonly MIME_TYPE_PDF = 'application/pdf';

  openPDFSubscription: Subscription;

  constructor(
    private apiBonTravailService: ApiBonTravailService,
    private notesService: NotesService,
    private tableauUtilService: TableauUtilService
  ) {}

  private getColumDefsAction(isBonTravailManuel, isColSelectAll: boolean) {
    const PROPERTY_AUTH = isBonTravailManuel ? AUTH.EXPLOITATION_EDITIQUE.BONS_TRAVAIL_MANUEL : AUTH.SUIVI.BONS_TRAVAIL;
    const params = isBonTravailManuel
      ? {
          edit: {
            cellRendererParams: {
              modal: CreationBonTravailManuelModalComponent,
            },
          },
          delete: {
            cellRendererParams: {
              idsLabel: ['codbon', 'codapp_codorg_codenv', 'percod'],
              idsLabelSeparator: '|',
              messages: [
                'Suppression de ressources',
                'Vous êtes sur le point de supprimer la ressource',
                'Vous êtes sur le point de supprimer les ressources',
                'Suppression des ressources',
                'Les ressource suivantes ne peuvent pas être supprimées',
                'La ressource suivante ne peut pas être supprimée',
              ],
            },
          },
        }
      : {};
    const paramColShow: ParamColShowInterface = isBonTravailManuel
      ? {
          isColEditPopup: true,
          isColSelectAll: false,
        }
      : {
          isNoColDelete: true,
          isColSelectAll: isColSelectAll,
        };
    return this.tableauUtilService.getColsDefAction(PROPERTY_AUTH, paramColShow, params);
  }

  getColumnDefs(isBonTravailManuel = false, isColSelectAll = false): ColType[] {
    const columns = [
      this.getColCodbon(isBonTravailManuel),
      this.getColApplication(),
      this.getColPeriode(),
      this.getColFichier(),
      this.getColTotalPages(),
      this.getColTotalPlis(),
      this.getColDatePlanif(),
      this.getColDatePriseEnCompte(),
      this.getColDateExpedition(),
      this.getColDelai(),
      this.getColNotice(),
      this.getColInfosComp(),
      this.getColSite(),
    ];
    return this.getColumDefsAction(isBonTravailManuel, isColSelectAll).concat(columns);
  }

  private getColCodbon(isBonTravailManuel: boolean): ColType {
    return {
      field: 'codbon',
      headerName: 'Numéro bon',
      filter: 'agSetColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      sort: 'desc',
      width: 120,
      minWidth: 90,
      maxWidth: 140,
      cellRenderer: params => {
        const anchor = document.createElement('a');
        anchor.href = 'javascript:void(0);'; // Prevent default behavior
        anchor.innerText = params.data.codbon; // Display the 'codbon' value
        anchor.style.cursor = 'pointer'; // Make it look like a clickable link
        // Add click event listener
        anchor.addEventListener('click', () => this.onCodbonClick(params.data, isBonTravailManuel));
        return anchor;
      },
    };
  }

  onCodbonClick(data: any, isBonTravailManuel: boolean): void {
    const pdfInput = this.buildPdfInput(data, isBonTravailManuel);
    this.openPDFSubscription?.unsubscribe();
    this.openPDFSubscription = this.getPdfInputObservable(data, pdfInput, isBonTravailManuel)
      .pipe(
        take(1),
        switchMap(input => this.apiBonTravailService.getBonTravailPdf(input)),
        catchError(err => this.handlePdfDownloadError(err))
      )
      .subscribe(base64Pdf => this.openPdfInNewTab(base64Pdf));
  }

  private buildPdfInput(data: any, isBonTravailManuel: boolean): PdfInput {
    return {
      codbon: data.codbon,
      codenv: data.codenv,
      codorg: data.codorg,
      codapp: data.codapp,
      percod: data.percod,
      numcom: data.numcom,
      codcom: data.codcom,
      codfic: data.codfic,
      isManuel: isBonTravailManuel,
    };
  }

  private getPdfInputObservable(
    data: any,
    pdfInput: PdfInput,
    isBonTravailManuel: boolean
  ): Observable<PdfInput> {
    if (isBonTravailManuel) {
      return of(pdfInput);
    }

    const payload = this.buildManuelPayload(data);
    return this.apiBonTravailService.isBonTravailManuel(payload).pipe(
      map(isManuel => ({ ...pdfInput, isManuel }))
    );
  }

  private buildManuelPayload(data: any): IsBonTravailManuelInputInterface {
    return {
      codenv: data.codenv,
      codorg: data.codorg,
      codapp: data.codapp,
      percod: data.percod,
    };
  }

  private handlePdfDownloadError(err: any): Observable<null> {
    const errorMessage = this.extractErrorMessage(err);
    this.showErrorNotification(errorMessage);
    return of(null);
  }

  private extractErrorMessage(err: any): string {
    return err?.graphQLErrors?.[0]?.message || TableauBonTravailService.ERROR_PDF_DOWNLOAD_DEFAULT;
  }

  private showErrorNotification(errorMessage: string): void {
    this.notesService.show({
      title: errorMessage,
      classname: 'note-erreur',
      hideClose: false,
      category: ToastCategoryEnum.ERROR,
    });
  }

  private openPdfInNewTab(base64Pdf: string | null): void {
    if (base64Pdf) {
      const blob = this.base64ToBlob(base64Pdf, TableauBonTravailService.MIME_TYPE_PDF);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  private getColApplication(): ColType {
    return {
      field: 'codapp_codorg_codenv',
      headerName: 'Application',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      width: 110,
      minWidth: 110,
      maxWidth: 120,
    };
  }

  private getColPeriode(): ColType {
    return {
      field: 'percod',
      headerName: 'Période',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      sortable: true,
      width: 90,
      minWidth: 90,
      maxWidth: 120,
    };
  }

  private getColFichier(): ColType {
    return {
      field: 'codfic_codcom_numcom',
      headerName: 'Fichier',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      width: 100,
      minWidth: 100,
      maxWidth: 140,
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => (params.data && params.data.libfic ? params.data.libfic : ''),
    };
  }

  private getColTotalPages(): ColType {
    return {
      field: 'pagfic',
      headerName: 'Pages',
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      cellStyle: { 'justify-content': 'flex-end' },
      valueFormatter: params => {
        return FormatUtil.formatNumberWithThousandSeparators(params.value);
      },
    };
  }

  private getColTotalPlis(): ColType {
    return {
      field: 'plific',
      headerName: 'Plis',
      minWidth: 60,
      maxWidth: 60,
      cellStyle: { 'justify-content': 'flex-end' },
      valueFormatter: params => {
        return FormatUtil.formatNumberWithThousandSeparators(params.value);
      },
    };
  }

  private getColDatePlanif(): ColType {
    return {
      field: 'dappcr',
      headerName: 'Date planification',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      width: 170,
      minWidth: 135,
      maxWidth: 250,
      valueGetter: params => {
        if (params.data && params.data.dappcr) {
          return params.data.dappcr;
        }
      },
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDatePriseEnCompte(): ColType {
    return {
      field: 'drecep',
      headerName: 'Date prise en compte',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      width: 170,
      minWidth: 135,
      maxWidth: 250,
      valueGetter: params => {
        if (params.data && params.data.drecep) {
          return params.data.drecep;
        }
      },
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDateExpedition(): ColType {
    return {
      field: 'dfiexp',
      headerName: 'Date expédition',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      width: 170,
      minWidth: 110,
      maxWidth: 200,
      cellRenderer: DateEditorComponent,
      cellRendererParams: {
        formKey: 'dfiexp',
      },
    };
  }

  private getColDelai(): ColType {
    return {
      field: 'delmsp',
      headerName: 'Délai',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      minWidth: 70,
      maxWidth: 70,
    };
  }

  private getColNotice(): ColType {
    return {
      field: 'libnot',
      headerName: 'Notices',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      minWidth: 90,
      maxWidth: 90,
      cellStyle: { 'justify-content': 'flex-end' },
      // Utiliser le composant personnalisé pour mettre du html dans le tooltip
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) =>
        params.data && params.data.libnot ? params.data.libnot.map((item: string) => `- ${item}`).join('<br>') : '',
      valueGetter: params => {
        if (params.data) {
          return params.data.codnot?.length;
        }
      },
    };
  }

  private getColInfosComp(): ColType {
    return {
      field: 'inform',
      headerName: 'Infos complémentaires',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      flex: 1,
      minWidth: 140,
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'inform',
        allowedCharacters: [' ', '/', '-'],
      },
    };
  }

  private getColSite(): ColType {
    return {
      field: 'codsit',
      headerName: 'Site',
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      floatingFilterComponent: 'inputFilter',
      width: 60,
      minWidth: 60,
    };
  }
}
