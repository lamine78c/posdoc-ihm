import { Position } from 'vis-network';

export interface StatutForBtn {
  id: number;
  idParent: number;
  statut: string;
}

export interface Button {
  class: string;
  label: string;
  statut: string;
}

export interface HistoryOfPosition {
  id: number;
  y: number;
  numberOfChild: number;
}

export interface MenuData {
  position: Position;
  statut: string;
  etat: string;
  script: string;
  idetap: number;
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  numcom: string;
  codcom: string;
  codfic: string;
  codgam: string;
  codinf: number;
  codser: string;
  codsit: string;
  codres: string;
  coddes: string;
  reedit: boolean;
  etpfus: string;
  idtfus: number;
  numexe: string;
  nbrexe: number;
  codsig: string;
  signal: string;
  fabsim: boolean;
  create: string;
  valide: string;
  debute: string;
  termin: string;
  invali: string;
  suspen: string;
  stepno: number;
  numpid: number;
  clefus: string;
}

export interface MenuOption {
  label: string;
  action: string;
}

export interface MenuStyle {
  display: string;
  top: string;
  left: string;
}

export class VideoStepDetailsFichierModel {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
}

export interface VideoStepDetailsFichierInterface {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
  libfic: string;
  refimp: string;
  codcli: string;
  dfiexp: string;
  pagfic: string;
  plific: string;
  rejfic: string;
}
