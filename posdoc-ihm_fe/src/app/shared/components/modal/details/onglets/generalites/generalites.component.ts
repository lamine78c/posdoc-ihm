import { Component, Input, OnInit } from '@angular/core';
import { ApiGeneralitesService } from '@app/services/api-adelaide/supervision/production/details/api-generalites.service';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { GeneralitesInterface } from '@app/models/supervision/production/details/generalites-interface';

@Component({
  selector: 'app-generalites',
  templateUrl: './generalites.component.html',
  styleUrls: ['./generalites.component.scss'],
  standalone: false,
})
export class GeneralitesComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  occurenceData: any[] = [];
  constructor(
    private apiGeneralitesService: ApiGeneralitesService,
    private generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.getOccurenceApplicationDetails();
  }

  getOccurenceApplicationDetails(): void {
    this.apiGeneralitesService.getDetailsGeneralites(this.paramData).subscribe(response => {
      this.occurenceData = [];
      response.data.getDetailsGeneralites.forEach((responseData: GeneralitesInterface) => {
        const typeRef = responseData.typref;
        this.occurenceData.push(
          ['Désignation', responseData.libelle],
          ['Réfection ?', responseData.arefec ? 'Oui' : 'Non'],
          ['Type de réfection', `Réfection avec les paramètres ${typeRef}`],
          ['', ''],
          ['Statut', `${responseData.appsta}-${responseData.appinf}`],
          ['Date création', responseData.dapplc ? SharedUtil.formatDateToDDMMYYYYHHMMSS(responseData.dapplc) : ''],
          ['Date début', responseData.dappld ? SharedUtil.formatDateToDDMMYYYYHHMMSS(responseData.dappld) : ''],
          ['Date fin', responseData.dapplt ? SharedUtil.formatDateToDDMMYYYYHHMMSS(responseData.dapplt) : ''],
          ['Date supension', responseData.dappls ? SharedUtil.formatDateToDDMMYYYYHHMMSS(responseData.dappls) : ''],
          ['Date historique', responseData.dapplh ? SharedUtil.formatDateToDDMMYYYYHHMMSS(responseData.dapplh) : '']
        );
      });
    });
  }

  printPdf(): void {
    const headers = ['Propriété', 'Valeur'];
    const title = `Généralités sur l'application ${this.paramData.codEnv}-${this.paramData.codOrg}-${this.paramData.codApp}-${this.paramData.perCod}`;
    const columnWidths = ['auto', '*'];
    const nbrRows = this.occurenceData.length;

    this.generateFileService['generatePDFFile'](this.occurenceData, headers, title, {
      pageOrientation: 'landscape',
      nombreTotal: nbrRows,
      columnWidths: columnWidths,
    });
  }
}
