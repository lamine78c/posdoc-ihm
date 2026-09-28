export interface VolumeTraiteSearchInput {
  codEnv: string;
  codOrgs: string[];
  toDate: string;
  fromDate: string;
  resGamSitList: ResGamSitInput[];
}

export interface ResGamSitInput {
  codRes: string;
  codGam: string;
  codSit: string;
}

export function setVolumeTraiteSearchInput(
  codEnv: string,
  codOrgs: string[],
  toDate: string,
  fromDate: string,
  resGamSitList: ResGamSitInput[]
): VolumeTraiteSearchInput {
  return {
    codEnv: codEnv,
    codOrgs: codOrgs,
    toDate: toDate,
    fromDate: fromDate,
    resGamSitList: resGamSitList,
  };
}

export function setResGamSitList(codRes: string, codGam: string, codSit: string): ResGamSitInput {
  return {
    codRes: codRes,
    codGam: codGam,
    codSit: codSit,
  };
}

export interface VolumesTraitesResultInterface {
  getVolumestraites: {
    volumesTraitesList: VolumesTraitesInterface[];
    message: string;
  };
}

export interface VolumesTraitesInterface {
  codorg: string;
  codapp: string;
  codfic: string;
  codcom: string;
  codgam: string;
  codsit: string;
  coddes: string;
  codres: string;
  sumpagfic: number;
  ressource: string;
  codreg: string;
  libdes: string;
}
