export interface GetConfigDataForAddInterface {
  allFormats: AllFormatsInterface[];
  allClients: AllClientsInterface[];
  allSupports: AllSupportsInterface[];
  findAllOrganiClient: AllOrganiClientInterface[];
}

export interface AllClientsInterface {
  code: string;
}

export interface AllFormatsInterface {
  code: string;
  libelle: string;
}

export interface AllSupportsInterface {
  type: string;
  libelle: string;
}

export interface AllOrganiClientInterface {
  codorg: string;
  codcli: string;
}
