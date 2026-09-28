import { Injectable } from '@angular/core';
import { EnvOrgsInput, GetDistRessByEnvOrgsInterface, GetEnvsOrgsSelectionFromGenETPInterface } from '@app/models/suivi/volume-traite-interface';
import { VolumesTraitesResultInterface, VolumeTraiteSearchInput } from '@app/suivi/volume-traite/model/search-volume-traite';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideVolumeTraiteService {
  constructor(private apollo: Apollo) {}

  public getVolumestraites(query: VolumeTraiteSearchInput) {
    return this.apollo.watchQuery<VolumesTraitesResultInterface>({
      query: gql`
        query GetVolumestraites($query: VolumesTraitesSearchQuery) {
          getVolumestraites(query: $query) {
            volumesTraitesList {
              codorg
              codapp
              codfic
              codcom
              codgam
              codsit
              coddes
              codres
              sumpagfic
            }
            message
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getAllSelectConfig() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allEnvironnements {
            code
          }
          allOrganismes {
            code
            libelle
            codeRegion
          }
          allDestinataires {
            code
            libelle
            codeOrg
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getGamSitResByEnvOrgs(query: EnvOrgsInput) {
    return this.apollo.watchQuery<GetDistRessByEnvOrgsInterface>({
      query: gql`
        query getGamSitResByEnvOrgs($query: EnvOrgsQuery) {
          getGamSitResByEnvOrgs(query: $query) {
            codres
            codgam
            codsit
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getEnvsOrgsSelectionFromGenETP() {
    return this.apollo.watchQuery<GetEnvsOrgsSelectionFromGenETPInterface>({
      query: gql`
        query getEnvsOrgsSelectionFromGenETP {
          getDistinctEnvsFromGenEtp
          getDistinctOrgsFromGenEtp
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
