/* eslint-disable */
import { AdresseType } from './adresse-type';
export interface EntrepriseType {
  /**
   * Activite principale de l'entreprise
   */
  activite?: string;

  /**
   * Adresses de l'entreprise
   */
  adresses?: Array<AdresseType>;

  /**
   * Date de creation
   */
  dateCreation?: string;

  /**
   * Date de fondation
   */
  dateFondation?: string;

  /**
   * Date de derniere mise a jour (obligatoire pour les services de maj)
   */
  dateMaj?: string;

  /**
   * Denomination de l'entreprise
   */
  denomination?: string;

  /**
   * Identifiant de l'adresse
   */
  id?: number;

  /**
   * Code NAF de l'entreprise
   */
  naf?: string;

  /**
   * Numero SIREN de l'entreprise
   */
  siren?: string;
}
