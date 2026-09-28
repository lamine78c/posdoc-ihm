export interface AllRegionsInterface {
  allRegions: AllRegions[];
}

export interface AllRegions {
  code: string;
  libelle: string;
  isNotAuthorisedToBeDeleted: boolean;
}
