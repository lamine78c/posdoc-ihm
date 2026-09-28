export interface CodLibCommande {
  code: string;
  libelle: string;
}

export interface CodLibCommandeResultInterface {
  getCodLibCommandeByEnvOrgApp: CodLibCommande[];
}

export interface CommandeFilters {
  codenv: string;
  codorg: string;
  codapp: string;
}
