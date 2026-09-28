export interface FichiersQueryInterface {
  updateFichiers?: FichierInterface[];
  updateFichiersFromAdressesRetour?: FichierInterface[];
  updateFichiersFromFondDePage?: FichierInterface[];
  getFichiersForAdsNull?: FichierInterface[];
}

export interface FichierInterface {
  codeEnv: string;
  codeApp: string;
  codeCom: string;
  codeFich: string;
  codeProd: string;
  refImprime: string;
  libFichier: string;
  codeOrg: string;
  codeAdr: string;
  refFormat: string;
  typeFormat: string;
  page: number;
  codeClient: string;
  typeMultif: string;
  typeSupport: string;
  typeSig: string;
  refSupport: string;
  eclatement: number;
  codeDocument: string;
}
