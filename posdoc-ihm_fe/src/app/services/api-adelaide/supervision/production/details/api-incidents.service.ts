import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { ParamIncidentApiModel } from '@app/models/supervision/production/details/param-incident-api-model';
import { DetailsIncidentsInterface, DetailsIncidentsOccEtapeInterface } from '@app/models/supervision/production/details/incidents-interface';

@Injectable({
  providedIn: 'root',
})
export class ApiIncidentsService {
  constructor(private apollo: Apollo) {}

  public getDetailsIncident(paramData: ParamIncidentApiModel) {
    return this.apollo.watchQuery<DetailsIncidentsInterface>({
      query: gql`
        query getDetailsIncident($paramData: ParamDataIncidentInput!) {
          getDetailsIncident(paramData: $paramData) {
            signal
            dcreat
            script
            mesano
            ficinf
            typetp
            codcom
            codfic
            numcom
            codgam
            codsit
            codres
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getIncidentsByIdetap(idetap: number, idtfus: number) {
    return this.apollo.watchQuery<DetailsIncidentsOccEtapeInterface>({
      query: gql`
        query getIncidentsByIdetap($idetap: Int!, $idtfus: Int!) {
          getIncidentsByIdetap(idetap: $idetap, idtfus: $idtfus) {
            dcreat
            script
            mesano
          }
        }
      `,
      variables: {
        idetap: idetap,
        idtfus: idtfus,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
