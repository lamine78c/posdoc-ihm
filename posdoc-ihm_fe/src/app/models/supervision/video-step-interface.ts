import { AllOrganismeInterface } from '@app/models/exploitation-editique/massification/all-organisme-interface';

export interface OccurrenceEtapeSearchDataInterface {
  getOccurrenceEtapeSearchData: OccurrenceEtapeSearchData[];
  allOrganismes: AllOrganismeInterface[];
}

export interface DistinctGamsAndComsByEnvsAndOrgsAndAppsAndPercodsInterface {
  getDistinctGamsByEnvsAndOrgsAndAppsAndPercods: string[];
  getDistinctComsByEnvsAndOrgsAndAppsAndPercods: string[];
}

export interface VideoStepInterface {
  getVideoSteps: VideoStep[];
  getFirstVideoStep: VideoStep;
}

export interface OccurrenceEtapeSearchData {
  codenv: string;
  codorg: string;
  codapp: string;
}

export interface VideoStep {
  idpere: number;
  idetap: number;
  typetp?: string;
  codenv?: string;
  codorg?: string;
  codapp?: string;
  percod?: string;
  numcom?: string;
  codcom?: string;
  codfic?: string;
  codgam?: string;
  statut?: string;
  codinf?: number;
  codser?: string;
  codsit?: string;
  codres?: string;
  coddes?: string;
  reedit?: boolean;
  etpfus?: string;
  script?: string;
  idtfus?: number;
  numexe?: string;
  nbrexe?: number;
  codsig?: string;
  signal?: string;
  fabsim?: boolean;
  create?: string;
  valide?: string;
  debute?: string;
  termin?: string;
  invali?: string;
  suspen?: string;
  histor?: string;
  stepno?: number;
  numpid?: number;
  clefus?: string;
}

export interface VideoStepInput {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codgam: string;
  reedit: boolean;
  etpfus: string;
  statut: string;
}
