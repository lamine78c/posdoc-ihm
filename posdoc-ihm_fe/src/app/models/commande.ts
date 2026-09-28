export class Commande {
  code: string;
  libelle: string;
  codenv: string;
  codorg: string;
  codapp: string;

  constructor(code: string, libelle: string, codenv: string, codorg: string, codapp: string) {
    this.code = code;
    this.libelle = libelle;
    this.codenv = codenv;
    this.codorg = codorg;
    this.codapp = codapp;
  }
}

export interface SearchComByEnvOrgAppDataInterface {
  getDistComByEnvOrgAppFromExemplaire: string[];
}

export interface CommandeDTOInterface {
  code: string;
  libelle: string;
  codenv: string;
  codorg: string;
  codapp: string;
  codreg: string;
  isNotAuthorisedToBeDeleted: boolean;
}

export interface PreselectedCommandeDTOInterface {
  commandes: CommandeDTOInterface[];
  message?: string;
}
