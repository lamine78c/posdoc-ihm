export interface AllImprimeInterface {
  allImprimes: AllImprimes[];
  allComposs: AllComposs[];
  allColimps: AllColimps[];
}

export interface AllImprimes {
  reference: string;
  libelle: string;
  codeRND: string;
  typeComposition: string;
  typeCouleur: string;
  rectoVerso: boolean;
  isNotAuthorisedToBeDeleted: boolean;
}

export interface AllComposs {
  typmef: string;
  libmef: string;
}

export interface AllColimps {
  typcol: string;
  libcol: string;
}
