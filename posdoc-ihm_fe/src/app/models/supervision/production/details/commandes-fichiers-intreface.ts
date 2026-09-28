export interface CommandesFichiersIntreface {
  codcom: string;
  numcom: string;
  codfic: string;
  libelle: string;
  codprd: string;
  refimp: string;
  libfic: string;
  ficsta: string;
  ficinf: string;
  dappcr: string;
  dfichd: string;
  dficht: string;
  dfichs: string;
  frefec: string;
  ficvid: string;
}

export interface DetailsCommandesFichiersInterface {
  getDetailsCommandesFichiers: CommandesFichiersIntreface[];
}
