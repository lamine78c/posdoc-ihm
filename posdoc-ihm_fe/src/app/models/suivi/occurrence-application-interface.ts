export interface OccurrenceApplicationSuiviProductionInterface {
  getOccurrenceApplicationForSuiviProduction: {
    occurrencesApplication: OccurrenceApplicationSuiviProduction[];
    message?: string;
  };
}

export interface OccurrenceApplicationSuiviProduction {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  appsta: string;
  appinf: string;
  arefec: boolean;
  dappld: string;
  dapplt: string;
  dappls: string;
  manuel: boolean;
  codsit: string;
  codcom: string;
  codfic: string;
  numcom: string;
  codprd: string;
  ficsta: string;
  ficinf: string;
  frefec: boolean;
  ficvid: boolean;
  dappcr: string;
  dfichd: string;
  dficht: string;
  dfichs: string;
  codenv_codorg_codapp_percod?: string;
}

export interface OccurrenceApplicationFilter {
  codenv: string;
  codorgs?: string[];
  codapp?: string;
  percod: string;
  codsit: string;
}
