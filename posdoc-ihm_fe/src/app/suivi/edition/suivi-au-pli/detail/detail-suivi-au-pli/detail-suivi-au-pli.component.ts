import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ZERO } from '@app/shared/utils/Constants';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { getFullAdresse } from '../../model/adresse-pli';
import { getEtatPliText, getSuivi } from '../../model/etat-pli';
import { ApiAdelaideSuiviAuPliService } from '../../service/api-adelaide-suivi-au-pli.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-detail-suivi-au-pli',
  standalone: false,
  templateUrl: './detail-suivi-au-pli.component.html',
  styleUrl: './detail-suivi-au-pli.component.scss',
})
@AutoUnsubscribe
export class DetailSuiviAuPliComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() title: string;
  @Input() numpli: string;
  detail = [];
  suiviEtat = [];
  subscriptions: Subscription[] = [];
  listKeyLibelle;
  listKeys;

  constructor(
    private apiAdelaideSuiviAuPliService: ApiAdelaideSuiviAuPliService,
    private datepipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.getDetail();
    this.listKeyLibelle = {
      numpli: 'SmartData',
      idtpli: 'Compte',
      genpro: 'Origine du pli',
      codgam: 'Code gamme',
      fulladress: 'Adresse complète',
      codpos: 'Code postal',
      codpay: 'Code pays',
      status: 'Statut du pli',
      dplidc: 'Date de création',
      datdep: 'Date de dépôt',
      mpsidd: 'Numéro de dépôt',
      coupli: 'Coup pli',
      nbpage: 'Nombre pages',
      nbfeui: 'Nombre feuilles',
      poipli: 'Poids du pli',
      infcl1: 'Champ1 rectec1',
      infcl2: 'Champ2 rectec1',
      dplidd: 'dplidd',
      dplidt: 'dplidt',
      dplide: 'dplide',
      dplidh: 'dplidh',
      plista: 'plista',
      pliinf: 'pliinf',
      edtype: 'edtype',
      expad1: 'expad1',
      expad2: 'expad2',
      expad3: 'expad3',
      expad4: 'expad4',
      cominf: 'cominf',
      proSta: 'Statut genpro',
      proInf: 'Numéro info statut genpro',
      prefec: 'Réfection genpro',
      dprodc: 'Date de création genpro',
      dprodd: 'Date débutée genpro',
      dprodt: 'Date terminée genpro',
      dprods: 'Date suspendue genpro',
      dprodh: 'Date historisée genpro',
      codenv: 'Code environnement de mas.',
      codorg: 'Code organisme de mas.',
      codapp: 'Code application de mas.',
      codcom: 'Code commande de mas.',
      codfic: 'Code fichier de mas.',
      numcom: 'Numéro commande de mas.',
      percod: 'Période codifiée de mas.',
    };
    this.listKeys = Object.keys(this.listKeyLibelle);
  }

  getDetail() {
    this.subscriptions.push(
      this.apiAdelaideSuiviAuPliService.searchPliByNumpli(this.numpli).pipe(take(1)).subscribe(data => {
        const row = data.data.searchPliByNumpli;
        const sep = '<br />';
        row.fulladress = getFullAdresse(data.data.searchPliByNumpli, sep);
        this.detail = this.transfertDetailFromData(row);
        let index = ZERO;
        const suivi = getSuivi(data.data.searchPliByNumpli.status, row.codgam);
        suivi &&
          suivi.map(o => {
            index !== ZERO && this.suiviEtat.push({ TEXT_CLASS: o.TEXT_CLASS });
            if (o.DATE_KEY) {
              o.DATE = this.detail.filter(d => d.KEY === o.DATE_KEY)[ZERO]?.VALUE;
            }
            this.suiviEtat.push(o);
            index++;
          });
      })
    );
  }

  private transfertDetailFromData(data) {
    const detail = [];
    const listDateTime = ['dplidc', 'dplidd', 'dplidt', 'dplide', 'dplidh', 'dprodc', 'dprodd', 'dprodt', 'dprods', 'dprodh'];
    const listDate = ['datdep'];
    const listHtml = ['fulladress'];
    Object.keys(data).forEach(key => {
      const libelle = this.getLibelle(key);
      let value = '';
      if (libelle) {
        if (key === 'status') {
          value = getEtatPliText(data[key]);
        } else if (data[key] && listDateTime.includes(key)) {
          value = this.datepipe.transform(data[key], 'dd/MM/yyyy HH:mm:ss');
        } else if (data[key] && listDate.includes(key)) {
          value = this.datepipe.transform(data[key], 'dd/MM/yyyy');
        } else {
          value = data[key];
        }
        detail.push({ KEY: key, LIBELLE: libelle, VALUE: value, INDEX: this.listKeys.indexOf(key), ISHTML: listHtml.includes(key) });
      }
    });
    return detail.sort((a, b) => a.INDEX - b.INDEX);
  }

  private getLibelle(key) {
    return this.listKeyLibelle[key] ?? '';
  }
}
