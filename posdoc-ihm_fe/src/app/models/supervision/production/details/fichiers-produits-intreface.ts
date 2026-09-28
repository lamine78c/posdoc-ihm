export interface FichiersProduitsIntreface {
  codcom: string;
  codfic: string;
  numcom: string;
  refimp: string;
  codprd: string;
  libFichier: string;
  pagFic: number;
  codgam: string;
  codsit: string;
  codres: string;
  coddes: string;
  nbrexe: number;
}

export interface DetailsFichiersProduitsIntreface {
  getDetailsFichiersProduits: FichiersProduitsIntreface[];
}
