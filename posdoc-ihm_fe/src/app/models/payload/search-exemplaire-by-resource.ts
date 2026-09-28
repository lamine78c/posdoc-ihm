export interface SearchExemplaireByResourceQuery {
  codenv: string;
  codorgs: string[];
  codapp: string;
  codcom: string;
  codfics: string[];
  ressources: string[];
  isRessourcesAbsentes: boolean;
  message?: string;
}
