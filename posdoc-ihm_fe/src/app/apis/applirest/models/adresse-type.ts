/* eslint-disable */
import { CommuneType } from './commune-type';
export interface AdresseType {
  commune?: CommuneType;

  /**
   * Identifiant de l'adresse
   */
  id?: number;

  /**
   * Premiere ligne de l'adresse
   */
  ligne1?: string;

  /**
   * Seconde ligne de l'adresse
   */
  ligne2?: string;
}
