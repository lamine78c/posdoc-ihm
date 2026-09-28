import { AllOrgRegionInterface } from './exploitation-editique/massification/all-organisme-interface';

export interface ExemplaireByResourceInterface {
  getExemplairesByRessource: ExemplaireByResource[];
  allOrganismes: AllOrgRegionInterface[];
}

export interface ExemplaireByResource {
  codreg: string;
  codorg: string;
  codcom: string;
  codfic: string;
  message: string;
  ressources: ExemplaireRessource[];
}

export interface ExemplaireRessource {
  exemplaireExists: boolean;
  codgam: string;
  codres: string;
  codsit: string;
  codorg: string;
  etat: boolean;
  coddes: string;
  hasProfil: boolean;
}
