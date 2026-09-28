export interface ParamsEnvOrgsAppInterface {
  codenv: string;
  codorgs: string[];
  codapp: string;
  isProfilAdmin: boolean;
}

export interface RessourceInterface {
  codgam: string;
  codsit: string;
  codres: string;
}

export interface DestinatairesInterface {
  getCodeDestinatairesByCodeOrgs: string[];
}

export interface RessourcesInterface {
  getRessourcesByCodeEnvOrgsApp: RessourceInterface[];
}

export interface RessourceDataInterface {
  codgam: string;
  codres: string;
  coddes: string;
}

export interface ExemplaireInterface {
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  exeact: boolean;
  nbrexe: number;
  coddes: string;
  codres: string;
  codfic: string;
  codgam: string;
  numexe: number;
  codsit: string;
}

export interface UpdateMasseExemplairesInterface {
  updateMasseExemplaires: ExemplaireInterface[];
}

export interface CreateExemplairesInterface {
  createExemplaires: ExemplaireInterface[];
}

export interface UpdateExemplairesInterface {
  updateExemplaires: ExemplaireInterface[];
}
