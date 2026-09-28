export interface SearchActionUtilisateurByQuery {
  dtdeb: string;
  dtfin: string;
  result?: boolean;
  user?: string;
  action?: string;
  form?: string;
}

export interface SearchActionUtilisateurByQueryResultInterface {
  findUtiLogByQuery: SearchActionUtilisateurByQueryResult[];
}

export interface SearchActionUtilisateurByQueryResult {
  codulo: string;
  codsta: string;
  codusr: string;
  formid: string;
  datulo: string;
  action: string;
  params: string;
  result: boolean;
  versio: string;
  erreur: string;
  ko: boolean;
}

export interface FindDistinctUserUtilogResultInterface {
  findDistinctUserUtilog: string[];
}

export interface FindDistinctEntityUtilogResultInterface {
  findDistinctFormIdUtilog: string[];
}

export interface FindDistinctActionUtilogResultInterface {
  findDistinctActionUtilog: string[];
}
