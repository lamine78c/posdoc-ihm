import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { ONE } from '@app/shared/utils/Constants';
import { of } from 'rxjs';
import { ApiAdelaideSuiviAuPliService } from '../../service/api-adelaide-suivi-au-pli.service';
import { DetailSuiviAuPliComponent } from './detail-suivi-au-pli.component';

describe('DetailSuiviAuPliComponent', () => {
  let component: DetailSuiviAuPliComponent;
  let fixture: ComponentFixture<DetailSuiviAuPliComponent>;
  let apiAdelaideSuiviAuPliService: jasmine.SpyObj<ApiAdelaideSuiviAuPliService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiAdelaideSuiviAuPliService', ['searchPliByNumpli']);

    await TestBed.configureTestingModule({
      declarations: [DetailSuiviAuPliComponent],
      providers: [DatePipe, { provide: ApiAdelaideSuiviAuPliService, useValue: apiServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(DetailSuiviAuPliComponent);
    component = fixture.componentInstance;
    component.listKeyLibelle = {
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
    }
    component.listKeys = Object.keys(component.listKeyLibelle);
    apiAdelaideSuiviAuPliService = TestBed.inject(ApiAdelaideSuiviAuPliService) as jasmine.SpyObj<ApiAdelaideSuiviAuPliService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate detail on successful API call', () => {
    const mockResponse = {
      data: {
        searchPliByNumpli: [
          {
            numpli: '86402335974617R',
            codenv: 'P',
            codorg: '00L',
            codapp: 'MAS',
            percod: '240410-0N',
            codcom: 'MAS2',
            codfic: 'M2312',
            numcom: '00',
            plista: 'C',
            pliinf: '000',
            zoncli: 'P_00L_MAS_240410-0N_00_MAS2_M2312_*',
            dplidc: '2025-06-01T12:30:22',
            dplidd: '2025-06-01T12:30:22',
            dplidt: null,
            dplide: null,
            dplidh: null,
            nbpage: '000',
            nbfeui: '000',
            edtype: 'PL',
            poipli: '00097',
            coupli: '0.000',
            idtpli: '427 000000323190041',
            codpos: '     ',
            codpay: 'ZN2',
            adres1: 'BIENVENU MOUKOUMANI YAKITE              ',
            adres2: 'CONGO BRAZZAVIILE MARABOU ET GRA        ',
            adres3: 'BIENVENU MOUKOUMANI                     ',
            adres4: '4839 NEW YORK CENTRAL PARK              ',
            adres5: 'NEW YORK UNITED STATES AME              ',
            adres6: 'ETATS UNIS D AMERIQUE                   ',
            expad1: "D'ALSACE",
            expad2: null,
            expad3: '67945 STRASBOURG CEDEX 9',
            expad4: null,
            genpro: 'p_427_snv2_240404-00_00_pi04_l01_ma',
            infcl1: null,
            infcl2: null,
            datdep: '2025-06-01',
            mpsidd: null,
            status: null,
            cominf: null,
            codgam: null,
            prosta: null,
            proinf: null,
            prefec: true,
            dprodc: null,
            dprodd: null,
            dprodt: null,
            dprods: null,
            dprodh: null,
            pagfic: null,
            plific: null,
            rejfic: null,
          },
        ],
      },
    };
    component.numpli = '86402335974617R';
    apiAdelaideSuiviAuPliService.searchPliByNumpli.and.returnValue(of(mockResponse as any));
    component.getDetail();
    expect(apiAdelaideSuiviAuPliService.searchPliByNumpli).toHaveBeenCalledWith(component.numpli);
    expect(component.detail.length).toBe(ONE);
  });
});
