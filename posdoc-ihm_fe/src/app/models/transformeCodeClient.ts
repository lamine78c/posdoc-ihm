import { AllOrganiClientInterface } from '@app/produit/fichier/model/get-config-data-for-add-interface';
import { AllOrgRegionInterface } from './exploitation-editique/massification/all-organisme-interface';

export interface transformCodeClientInterface {
  codeClient: string;
  codeOrganisme: string;
  orgCliSansRegValue: {}; // norme: {codOrg: codCli; codOrg: codCli; etc...}
  allOrgCliSnv2: AllOrganiClientInterface[];
  allClientList: [];
  allOrgReg: AllOrgRegionInterface[];
}

export interface getCodeClientByCodeOrganismeInterface {
  codeOrganisme: string;
  allOrgCliSnv2: AllOrganiClientInterface[];
  allClientList: [];
  allOrgReg: AllOrgRegionInterface[];
}

export interface isCodeClientGeneralInterface {
  codeApplication: string;
  codeClient: string;
  codeOrganisme: string;
  codeRegion: string;
  allOrgCliSnv2: AllOrganiClientInterface[];
}
