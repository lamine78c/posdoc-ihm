export class FichierId {
  codeEnv: string;
  codeOrg: string;
  codeApp: string;
  codeCom: string;
  codeFich: string;

  constructor(codeEnv: string, codeOrg: string, codeApp: string, codeCom: string, codeFich: string) {
    this.codeEnv = codeEnv;
    this.codeOrg = codeOrg;
    this.codeApp = codeApp;
    this.codeCom = codeCom;
    this.codeFich = codeFich;
  }
}
