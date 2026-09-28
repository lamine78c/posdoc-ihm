import {AllOrganismeDtoInterface} from "@app/models/organisme";

export class Fichier {
  codeEnv: string;
  codeOrg: string;
  codeApp: string;
  codeCom: string;
  codeFich: string;
  libFichier: string;
  refImprime: string;
  codeAdr: string;
  codeProd: string;
  refFormat: string;
  typeFormat: string;
  page: number;
  codeClient: string;
}

export interface NbFichierUpdatedInterface {
  createFichierWithExemplaire: {
    nbExemplaires: number;
    nbFichiers: number;
    nbProduits: number;
  };
}

export interface FichierCodficRefImprimeCodeProdInterface {
  codfic: string;
  refImprime: string;
  codeProd: string;
}

export interface DistFicByEnvOrgAppComFromExemplaireInterface {
  getDistFicByEnvOrgAppComFromExemplaire: FichierCodficRefImprimeCodeProdInterface[];
}

export interface SearchOrgByEnvDataInterface {
  getDistOrgByEnvFromFichier: string[];
  allOrganismes: AllOrganismeDtoInterface[];
}

export interface SearchAppByEnvOrgDataInterface {
  getDistAppByEnvOrgFromFichier: string[];
}

export interface SearchComByEnvOrgAppDataInterface {
  getDistComByEnvOrgAppFromFichier: string[];
}
