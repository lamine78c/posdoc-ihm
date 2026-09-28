export interface CreatePapaadInterface {
  createPapaad: PapaadInterface;
}

export interface PapaadInterface {
  codeCommande: string;
  codeFichier: string;
  codeNotif: string;
  libelle: string;
  periode: boolean;
  codeRND: string;
  appPro: string;
  typeHas: string;
  format: string;
  isUrib: string;
  nsTruc: boolean;
  imprime: boolean;
  huissier: boolean;
  numNot: boolean;
  strRaf: boolean;
  contrat: boolean;
  medele: boolean;
  idtbcc: boolean;
}
