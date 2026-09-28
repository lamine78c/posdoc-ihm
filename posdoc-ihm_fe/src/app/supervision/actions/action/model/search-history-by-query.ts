export interface SearchHistoryByQuery {
  dtdeb: string;
  dtfin: string;
  user?: string;
  action?: string;
  entity?: string;
}

export interface SearchHistoryByCoduloResultInterface {
  findHistoryByCodulo: SearchHistoryByCoduloResult[];
}

export interface SearchHistoryByCoduloResult {
  id: string;
  station: string;
  utilisateur: string;
  insertionDate: string;
  actionUtilisateur: string;
  condition: string;
  entite: string;
  entree: string;
  sortie: string;
}

export interface SearchHistoryByQueryResultInterface {
  findHistoryByQuery: SearchHistoryByQueryResult[];
}

export interface SearchHistoryByQueryResult {
  id: string;
  station: string;
  utilisateur: string;
  insertionDate: string;
  actionUtilisateur: string;
  condition: string;
  entite: string;
  entree: string;
  sortie: string;
}

export interface FindDistinctUserResultInterface {
  findDistinctUser: string[];
}

export interface FindDistinctEntityResultInterface {
  findDistinctEntity: string[];
}
