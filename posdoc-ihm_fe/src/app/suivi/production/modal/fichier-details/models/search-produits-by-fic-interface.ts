export interface SearchProduitsByFichierInput {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
}

export interface SearchProduitsByFichierPayloadDTO {
  searchProduitsByFichier: SearchProduitsByFichierInterface[];
}

export interface SearchProduitsByFichierInterface {
  codgam: string;
  libgam: string;
  prosta: string;
  proinf: string;
  dprodd: string;
  dprodt: string;
  dprods: string;
  pagfic: number;
  plific: number;
  rejfic: number;
}
