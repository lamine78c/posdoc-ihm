export interface Tarif {
  type: string;
  numero: string;
  dateDebut: Date;
  dateFin: Date;
  coutPli: number;
  remise1: boolean;
  remise2: boolean;
  remise3: boolean;
  urgent: boolean;
}

export interface AllTarifsInterface {
  allTarifs: TarifsInterface[];
}

export interface TarifsInterface {
  type: string;
  numero: string;
  dateDebut: Date;
  dateFin: Date;
  coutPli: number;
  urgent: boolean;
}

export interface Tarpos {
  type: string;
  libelle: string;
  ordre: number;
  tlibre: boolean;
  compta: boolean;
  perime: boolean;
  isNotAuthorisedToBeDeleted: boolean;
  tarifs: Tarif[];
}

export interface TarposDetails {
  allTarpos: Tarpos[];
}

export interface CreateTarifInput {
  createTarif: Tarif;
}

export interface UpdateTarifInput {
  updateTarif: Tarif;
}

export interface TarifDetail {
  getTarifsById: Tarif[];
}

export interface TarifFacture {
  type: string;
  compta: number;
  libre: boolean;
}
