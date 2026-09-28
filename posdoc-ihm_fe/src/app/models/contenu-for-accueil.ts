import { SafeHtml } from '@angular/platform-browser';

export interface ContenuForAccueilInterface {
  getContenusForAccueil: ContenuForAccueil[];
}

export interface ContenuForAccueil {
  index: number;
  titre: string;
  message: string;
  regions: string[];
  sanitizedMessage: SafeHtml;
}

export interface AideInterface {
  searchAll: Aide[];
}

export interface CreateAideResponse {
  createHelp: Aide[];
}

export interface UpdateAideResponse {
  updateHelp: Aide[];
}

export interface ChangeStateHelpResponse {
  changeStateHelp: Aide[];
}

export interface PathCompletInterface {
  getAllPathComplet: PathComplet[];
}

export interface PathComplet {
  path: string;
  libelle: string;
}

export enum HelpStatusType {
  DRAFT = 'DRAFT',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export interface Aide {
  id: number;
  path: string;
  message: string;
  publish?: HelpStatusType;
  state?: HelpStatusType;
  createdAt: string;
  updatedAt: string;
}
