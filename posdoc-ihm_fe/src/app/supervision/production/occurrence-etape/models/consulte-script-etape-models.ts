export class ScriptPayload {
  script: string;
}

export interface AdelaideResultDTO {
  result: string;
  error: string;
}

export interface DetailsAdelaideResultInterface {
  consulteScriptEtape: AdelaideResultDTO;
}
