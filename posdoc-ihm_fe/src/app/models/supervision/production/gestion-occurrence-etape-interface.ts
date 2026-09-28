import { AllOrganismeInterface } from '@app/models/exploitation-editique/massification/all-organisme-interface';

export interface GestionOccurrenceEtapeInterface {
  id: number;
  typetp: string;
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  numcom: string;
  codfic: string;
  codgam: string;
  numexe: string;
  codres: string;
  codsit: string;
  coddes: string;
  nbrexe: number;
  codser: string;
  codsig: string;
  signal: string;
  reedit: boolean;
  fabsim: boolean;
  statut: string;
  codinf: number;
  create: string;
  valide: string;
  debute: string;
  termin: string;
  invali: string;
  suspen: string;
  histor: string;
  script: string;
  numpid: number;
  etpfus: string;
  clefus: string;
  idtfus: number;
}
export interface OccurrenceEtapeInputInterface {
  id: number;
  statut: string;
}

export interface SearchOccurrenceEtapeInterface {
  searchOccurrenceEtape: GestionOccurrenceEtapeInterface[];
  allOrganismes: AllOrganismeInterface;
}

export interface GetPreselectedDataInterface {
  getPreselectedExemplaire: GetPreselectedExemplaireInterface[];
}

export interface GetPreselectedExemplaireInterface {
  codapp?: string;
  codcom?: string;
  codgam?: string;
  codorg?: string;
  codenv?: string;
  codfic?: string;
  numexe?: string;
  codsit?: string;
  codres?: string;
  coddes?: string;
  nbrexe?: number;
  exeact?: boolean;
  codeProd?: string;
  refImprime?: string;
  libFichier?: string;
  isAdmin?: boolean;
  ficatt?: string;
}

export interface ExemplaireByFilterQuery {
  codesEnv: [string];
  codesOrg: [string];
  codesApp: [string];
  codesCom: [string];
  codesFic: [string];
}

export function initExemplaireByFilterQuery(codesEnv, codesOrgs, codesApp, codesCom, codesFic): ExemplaireByFilterQuery {
  return {
    codesEnv: codesEnv,
    codesOrg: codesOrgs,
    codesApp: codesApp,
    codesCom: codesCom,
    codesFic: codesFic,
  };
}
