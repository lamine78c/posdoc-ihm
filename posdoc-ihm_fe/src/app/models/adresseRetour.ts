export class AdresseRetour {
  code: string;
  codeOrganisme: string;
  adresse1: string;
  adresse2: string;
  adresse3: string;
  adresse4: string;
  isNotAuthorisedToBeDeleted: boolean;
  collapse: any;
  detail: any;
  adresseCode: string;
}
export class AdresseRetourDTO {
  code: string;
  codeOrganisme: string;
  adresse1: string;
  adresse2: string;
  adresse3: string;
  adresse4: string;

  constructor(code?: string, codeOrganisme?: string, adresse1?: string, adresse2?: string, adresse3?: string, adresse4?: string) {
    this.code = code;
    this.codeOrganisme = codeOrganisme;
    this.adresse1 = adresse1;
    this.adresse2 = adresse2;
    this.adresse3 = adresse3;
    this.adresse4 = adresse4;
  }
}

export class DeleteAdresseRetourInput {
  code: string;
  codeOrganisme: string;
}

export interface AdresseRetourDetails {
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
