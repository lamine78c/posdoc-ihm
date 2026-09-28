import { AllOrgRegionInterface } from '@app/models/exploitation-editique/massification/all-organisme-interface';

export class FindOrganismesToCompleteInput {
  codenv!: string;
  codapp!: string;
  codcom!: string;
  codfic!: string;
  codgam!: string;
  codsit!: string;
  codres!: string;
  isadmin!: boolean;
}

export interface FindOrganismesToCompleteResult {
  allOrganismes: [AllOrgRegionInterface];
  findExemplaireOrganismeToComplete: string[];
}
