import { Component, Input, OnInit } from '@angular/core';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ParamIncidentApiModel } from '@app/models/supervision/production/details/param-incident-api-model';
import { ApiIncidentsService } from '@app/services/api-adelaide/supervision/production/details/api-incidents.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss'],
  standalone: false,
})
export class IncidentsComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  coldef: any;
  resultats: any[] = [];
  paramIncidentApiModel: ParamIncidentApiModel;

  constructor(
    private apiIncidentsService: ApiIncidentsService,
    private generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.coldef = [
      { header: 'Signal', field: 'signal', width: '5%' },
      { header: 'Date', field: 'dcreat', width: '10%' },
      { header: 'Script', field: 'script', width: '10%' },
      { header: 'Message explicatif', field: 'mesano', width: '25%' },
      { header: 'Fichier complémentaire', field: 'ficinf', width: '20%' },
      { header: 'Etape', field: 'typetp', width: '5%' },
      { header: 'Fichier', field: 'codfic', width: '10%' },
      { header: 'Gamme', field: 'codgam', width: '5%' },
      { header: 'Exemplaire', field: 'codsit', width: '10%' },
    ];
    this.paramIncidentApiModel = {
      codEnv: this.paramData.codEnv,
      codOrg: this.paramData.codOrg,
      codApp: this.paramData.codApp,
      perCod: this.paramData.perCod,
    };
    this.getOccurenceApplicationDetailsIncidents();
  }

  getOccurenceApplicationDetailsIncidents(): void {
    this.apiIncidentsService.getDetailsIncident(this.paramIncidentApiModel).subscribe((data: any) => {
      this.resultats = data.data.getDetailsIncident.map(row => {
        row.dcreat = row.dcreat ? SharedUtil.formatDateToDDMMYYYYHHMMSS(row.dcreat) : null;
        row.codfic = row.codcom ? row.codcom + '-' + row.codfic + '-' + row.numcom : null;
        row.codsit = row.codsit ? row.codsit + '-' + row.codres : null;
        delete row.codcom;
        delete row.numcom;
        delete row.codres;
        return row;
      });
    });
  }

  imprimerPDF(): void {
    const headers = this.coldef.map((df: any) => df.header);
    const title = `Incidents sur l'application ${this.paramData.codEnv}-${this.paramData.codOrg}-${this.paramData.codApp}-${this.paramData.perCod}`;
    const pageOrientation = 'landscape';
    const columnWidths = this.coldef.map((df: any) => df.width);
    let dataPdf: any[] = [];
    this.resultats.forEach(row => dataPdf.push(this.coldef.map(df => row[df.field])));
    this.generateFileService['generatePDFFile'](dataPdf, headers, title, { pageOrientation: pageOrientation, columnWidths: columnWidths });
  }
}
