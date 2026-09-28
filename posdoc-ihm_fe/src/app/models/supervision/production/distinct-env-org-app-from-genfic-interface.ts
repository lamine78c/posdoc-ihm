import { AllOrganismeInterface } from '@app/models/exploitation-editique/massification/all-organisme-interface';
import { DataFromTmpMasGenFicGenProOrg } from '@app/models/exploitation-editique/massification/data-from-tmp-mas-gen-fic-gen-pro-org';
import { SitesCNPInterface } from '@app/models/exploitation-editique/massification/all-options-interface';
import { Application } from '@app/models/application';

export interface DistinctEnvOrgAppFromGenficInterface {
  getDistinctEnvOrgAppFromGenfic: DataFromTmpMasGenFicGenProOrg[];
  allOrganismes: AllOrganismeInterface[];
  allSitesCNP: SitesCNPInterface[];
  allApplications: Application[];
}
