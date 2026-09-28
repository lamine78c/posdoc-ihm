export interface SearchFacturationsByFichierInput {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
}

export interface SearchFacturationsByFichierPayloadDTO {
  searchFacturationsByFichier: {
    facturations: SearchFacturationsByFichierInterface[];
    fichiersMas: SearchFichiersByFichierMasInterface[];
  };
}

export interface SearchFacturationsByFichierInterface {
  typtar: string;
  libtar: string;
  nbplis: number;
  coutot: number;
}

export interface SearchFichiersByFichierMasInterface {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
  libtar: string;
  nbplis: number;
  coutot: number;
}
