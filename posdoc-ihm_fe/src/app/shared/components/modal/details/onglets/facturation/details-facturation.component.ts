import { Component, Input, OnInit } from '@angular/core';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ParamFacturation } from '@app/models/supervision/production/details/param-facturation';
import { ParamFacturationApiModel } from '@app/models/supervision/production/details/param-facturation-api-model';
import { ApiFacturationsService } from '@app/services/api-adelaide/supervision/production/details/api-facturations.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Component({
  selector: 'app-facturation',
  templateUrl: './details-facturation.component.html',
  styleUrls: ['./details-facturation.component.scss'],
  standalone: false,
})
export class DetailsFacturationComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  @Input() paramFacturation: ParamFacturation;
  coldef: any;
  resultats: any[] = [];
  paramFacturationApiModel: ParamFacturationApiModel;
  prefixTypTar = 'prefixTypTar_';
  prefixCout = 'prefixCout_';

  constructor(
    private apiFacturationsService: ApiFacturationsService,
    private generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.coldef = [];
    if (this.paramFacturation.bMasApp) {
      this.coldef.push({ header: 'Application', field: 'codapp' });
      this.coldef.push({ header: 'Période', field: 'percod' });
    }
    this.coldef.push({ header: 'Fichier', field: 'codfic' });
    this.coldef.push({ header: 'Code Prd', field: 'codprd' });
    this.coldef.push({ header: 'Client', field: 'codcli' });

    this.paramFacturation.allTarpos.forEach(typTar => {
      this.coldef.push({ header: 'Plis ' + typTar, field: this.prefixTypTar + typTar });
      this.coldef.push({ header: 'Coût ' + typTar, field: this.prefixCout + typTar });
    });

    this.coldef.push({ header: 'Date EXP', field: 'dfiexp' });

    this.paramFacturationApiModel = {
      codEnv: this.paramData.codEnv,
      codOrg: this.paramData.codOrg,
      codApp: this.paramData.codApp,
      perCod: this.paramData.perCod,
      isMasApp: this.paramFacturation.bMasApp,
    };

    this.getOccurenceApplicationDetailsFacturation();
  }

  getOccurenceApplicationDetailsFacturation() {
    this.apiFacturationsService.getDetailsFacturation(this.paramFacturationApiModel).subscribe((data: any) => {
      this.resultats = [];
      let rowKey = '';
      let row: any = {};
      data.data.getDetailsFacturation.map(r => {
        // la clé
        const rowKeyTmp = this.paramFacturation.bMasApp
          ? r.codcom + r.codfic + r.numcom + r.codenv + r.codorg + r.codapp + r.percod
          : r.codcom + r.codfic + r.numcom;
        // si la clé est changé
        if (rowKey && rowKey !== rowKeyTmp) {
          this.resultats.push(row); // ajoute dans la liste résultat
          row = {}; // nouvelle ligne
        }
        // update row data
        if (this.paramFacturation.bMasApp) {
          row.codapp = r.codenv + '-' + r.codorg + '-' + r.codapp;
          row.percod = r.percod;
        }
        row.codfic = r.codcom + '-' + r.codfic + '-' + r.numcom;
        row.codprd = r.codprd;
        row.codcli = r.codcli;
        row[this.prefixTypTar + r.typtar] = r.nbplis;
        row[this.prefixCout + r.typtar] = r.coutot / 1000;
        row.dfiexp = r.dfiexp ? SharedUtil.formatDateToDDMMYYYYHHMMSS(r.dfiexp) : null;
        // reset rowKey
        rowKey = rowKeyTmp;
      });
      // ajoute cette ligne dans la liste résultat si c'est rempli
      if (Object.keys(row).length > 0) {
        this.resultats.push(row);
      }
    });
  }

  exportAsExcel() {
    const headers = this.coldef.map((df: any) => df.header);
    const title = `Facturation sur l'application ${this.paramData.codEnv}-${this.paramData.codOrg}-${this.paramData.codApp}-${this.paramData.perCod}`;
    const data: any[] = [];
    this.resultats.forEach(row => {
      data.push(this.coldef.map(colDef => row[colDef.field]));
    });
    this.generateFileService['generateExcelFile'](data, headers, title);
  }
}
