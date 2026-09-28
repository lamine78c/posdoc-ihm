export class Destinataire {
  code: string;
  codeOrg: string;
  libelle: string;
  refPri: string;

  constructor(code: string, codeOrg: string, libelle: string, refPri: string) {
    this.code = code;
    this.codeOrg = codeOrg;
    this.libelle = libelle;
    this.refPri = refPri;
  }
}
