export interface FacturationsInterface {
  codcom: string;
  codfic: string;
  numcom: string;
  codprd: string;
  codcli: string;
  typtar: string;
  nbplis: number;
  coutot: number;
  dfiexp: string;
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
}

export interface DetailsFacturationsInterface {
  getDetailsFacturations: FacturationsInterface[];
}
