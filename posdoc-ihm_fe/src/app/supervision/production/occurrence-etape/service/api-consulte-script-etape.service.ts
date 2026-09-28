import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { DetailsAdelaideResultInterface, ScriptPayload } from '../models/consulte-script-etape-models';

@Injectable({
  providedIn: 'root',
})
export class ApiConsulteScriptEtapeService {
  constructor(private apollo: Apollo) {}

  consulteScriptEtape(scriptPayload: ScriptPayload) {
    return this.apollo.watchQuery<DetailsAdelaideResultInterface>({
      query: gql`
        query consulteScriptEtape($scriptPayload: ScriptPayload!) {
          consulteScriptEtape(scriptPayload: $scriptPayload) {
            result
            error
          }
        }
      `,
      variables: {
        scriptPayload: scriptPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
