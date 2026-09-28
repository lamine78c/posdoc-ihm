export class ressourceId {
  codeEnvironnement: string;
  codeOrganisme: string;
  codeApplication: string;
  codeGamme: string;
  codeRessource: string;
  codeSite: string;

  constructor(codeEnvironnement: string, codeOrganisme: string, codeApplication: string, codeGamme: string, codeSite: string, codeRessource: string) {
    this.codeEnvironnement = codeEnvironnement;
    this.codeOrganisme = codeOrganisme;
    this.codeApplication = codeApplication;
    this.codeGamme = codeGamme;
    this.codeSite = codeSite;
    this.codeRessource = codeRessource;
  }
}
