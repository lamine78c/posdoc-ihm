import { Component, Input, OnInit } from '@angular/core';
import { StainfIntreface } from '@app/models/supervision/production/details/stainf-intreface';
import { MenuData } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Component({
  selector: 'app-details-etape-occurrence-etape',
  templateUrl: './details-etape-occurrence-etape.component.html',
  styleUrls: ['./details-etape-occurrence-etape.component.scss'],
  standalone: false,
})
export class DetailsEtapeOccurrenceEtapeComponent implements OnInit {
  @Input() paramData: MenuData;
  @Input() allStaInf: StainfIntreface[];
  occurenceData: any[] = [];

  ngOnInit(): void {
    this.getOccurenceEtapeDetails();
  }

  getOccurenceEtapeDetails() {
    this.occurenceData = [];
    const m_bGenfic = !(this.paramData.etat === 'DEB' || this.paramData.etat === 'FIN' || this.paramData.etat === 'BIL');
    this.occurenceData.push(
      ['ID', this.paramData.idetap],
      ['Type', this.paramData.etat],
      ['Application', this.paramData.codenv + '-' + this.paramData.codorg + '-' + this.paramData.codapp],
      ['Période', this.paramData.percod],
      ['Fichier', m_bGenfic ? this.paramData.codcom + this.paramData.codfic + '-' + this.paramData.numcom : ''],
      ['Gamme', this.paramData.codgam],
      ['Ressource', this.paramData.etat === 'DIS' ? this.paramData.codsit + '-' + this.paramData.codres : ''],
      ['Copies', this.paramData.nbrexe],
      ['Destinataire', this.paramData.coddes],
      ['Serveur', this.paramData.codser],
      ['Signal', this.paramData.signal],
      ['', ''],
      ['Réfection?', this.paramData.reedit ? 'Oui' : 'Non'],
      ['Simulation?', this.paramData.fabsim ? 'Oui' : 'Non'],
      ['', ''],
      ['Statut', this.paramData.statut + '-' + this.paramData.codinf],
      [
        'Désignation statut',
        this.allStaInf?.find((e: StainfIntreface) => e.statut === this.paramData.statut && e.codinf === this.paramData.codinf)?.libinf,
      ],
      ['Date création', SharedUtil.formatDateToDDMMYYYYHHMMSS(this.paramData.create)],
      ['Date validation', SharedUtil.formatDateToDDMMYYYYHHMMSS(this.paramData.valide)],
      ['Date début', SharedUtil.formatDateToDDMMYYYYHHMMSS(this.paramData.debute)],
      ['Date terminaison', SharedUtil.formatDateToDDMMYYYYHHMMSS(this.paramData.termin)],
      ['Date suspension', SharedUtil.formatDateToDDMMYYYYHHMMSS(this.paramData.suspen)],
      ['Date invalidation', SharedUtil.formatDateToDDMMYYYYHHMMSS(this.paramData.invali)],
      ['', ''],
      ['Script', this.paramData.script],
      ['Pid', this.paramData.numpid],
      ['Step', this.paramData.stepno],
      ['', ''],
      ['Type fusion', this.paramData.etpfus],
      ['Clé fusion', this.paramData.clefus],
      ['ID fusion', this.paramData.idtfus]
    );
  }
}
