export interface OccurencePerApplication {
  codEnv: string;
  codOrg: string;
  codApp: string;
  perCod: string;
  appsta: string;
  dapplc: string;
  dappld: string;
  dapplt: string;
  codSit: string;
  // This attribute is calculated in the frontend to manage timeline groups
  groupId: string;
}
