import { SitesCNPInterface } from './exploitation-editique/massification/all-options-interface';
import { AllOrganismeDtoInterface } from './organisme';

export interface AsyncApiParametresEdition {
  allOrganismes: AllOrganismeDtoInterface[];
  allRessources: AllResourcesDtoInterface[];
  allDestinataires: AllDestinatairesDtoInterface[];
  allSitesCNP: SitesCNPInterface[];
}

export interface AllResourcesDtoInterface {
  codeRessource: string;
  libelle: string;
  codeEnvironnement: string;
  codeApplication: string;
  codeOrganisme: string;
  codeGamme: string;
  codeSite: string;
  profil: string;
}

export interface AllDestinatairesDtoInterface {
  code: string;
  libelle: string;
  codeOrg: string;
}
