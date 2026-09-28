export interface SearchOrgByEnvAppComFicsInput {
  codeEnv: string;
  codeApp: string;
  codeCom: string;
  codesFic: string[];
}

export function initSearchOrgByEnvAppComFicsInput(codeEnv, codeApp, codeCom, codesFic): SearchOrgByEnvAppComFicsInput {
  return {
    codeEnv: codeEnv,
    codeApp: codeApp,
    codeCom: codeCom,
    codesFic: codesFic,
  };
}
