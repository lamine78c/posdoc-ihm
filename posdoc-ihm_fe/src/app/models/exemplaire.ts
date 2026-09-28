export class Exemplaire {
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  codgam: string;
  numexe: number;
  codsit: string;
  codres: string;
  coddes: string;
  nbrexe: number;
  exeact: boolean;

  constructor(
    codenv: string,
    codorg: string,
    codapp: string,
    codcom: string,
    codfic: string,
    codgam: string,
    numexe: number,
    codsit: string,
    codres: string,
    coddes: string,
    nbrexe: number,
    exeact: boolean
  ) {
    this.codenv = codenv;
    this.codorg = codorg;
    this.codapp = codapp;
    this.codcom = codcom;
    this.codfic = codfic;
    this.codgam = codgam;
    this.numexe = numexe;
    this.codsit = codsit;
    this.codres = codres;
    this.coddes = coddes;
    this.nbrexe = nbrexe;
    this.exeact = exeact;
  }
}
