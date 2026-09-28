export interface SearchByEnvsOrgsAppProfilInput {
  codesEnv: string[];
  codesOrg: string[];
  codeApp: string;
  isProfilAdmin: boolean;
}

export function initSearchByEnvsOrgsAppProfilInput(
  codesEnv: string[],
  codesOrg: string[],
  codeApp: string,
  isProfilAdmin: boolean
): SearchByEnvsOrgsAppProfilInput {
  return {
    codesEnv: codesEnv,
    codesOrg: codesOrg,
    codeApp: codeApp,
    isProfilAdmin: isProfilAdmin,
  };
}
