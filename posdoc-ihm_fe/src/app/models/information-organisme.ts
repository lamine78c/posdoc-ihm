import { Organisme } from './organisme';

export interface InformationOrganisme {
  id: number;
  organisme: Organisme;
  message: string;
  actif: Boolean;
  date: string;
}
