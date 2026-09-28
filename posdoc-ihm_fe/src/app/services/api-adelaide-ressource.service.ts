import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GetRessourcesGamSitResResult,
  SearchRessourceByEnvOrgAppProfilInput,
} from '@app/models/exploitation-editique/reedition/reedition-produit/ressource-interface';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideRessourceService {
  constructor(private apollo: Apollo) {}

  public getAllRessources() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allRessources {
            codeEnvironnement
            codeOrganisme
            codeApplication
            codeGamme
            codeSite
            codeRessource
            codeServeur
            libelle
            type
            logicielDistribution
            referenceDistributionProduit
            referenceDistributionProduitRecap
            userId
            password
            typeFusion
            destinataire
            fileImpression
            informationUtilisateur
            fileBloquee
            miseSousPli
            profil
            isNotAuthorisedToBeDeleted
          }
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

  public createRessource(createRessource: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createRessource: CreateOrUpdateRessourceInput!) {
          createRessource(createRessource: $createRessource) {
            codeOrganisme
            codeApplication
            codeGamme
            codeSite
            codeServeur
            codeRessource
            libelle
            type
            logicielDistribution
            referenceDistributionProduit
            referenceDistributionProduitRecap
            userId
            password
            typeFusion
            destinataire
            fileImpression
            informationUtilisateur
            fileBloquee
            miseSousPli
            profil
          }
        }
      `,
      variables: {
        createRessource: createRessource,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateRessource(updateRessource: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateRessource: CreateOrUpdateRessourceInput!) {
          updateRessource(updateRessource: $updateRessource) {
            codeOrganisme
            codeApplication
            codeGamme
            codeSite
            codeServeur
            codeRessource
            libelle
            type
            logicielDistribution
            referenceDistributionProduit
            referenceDistributionProduitRecap
            userId
            password
            typeFusion
            destinataire
            fileImpression
            informationUtilisateur
            fileBloquee
            miseSousPli
            profil
          }
        }
      `,
      variables: {
        updateRessource: updateRessource,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteRessources(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeleteRessourceInput]!) {
          deleteRessources(deleteRessources: { ids: $ids }) {
            ok
          }
        }
      `,
      variables: {
        ids: ids,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteClients(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteClients(deleteClients: { ids: $ids }) {
            ok
          }
        }
      `,
      variables: {
        ids: ids,
      },
      fetchPolicy: 'no-cache',
    });
  }

  getAllSelectConfig() {
    return this.apollo.watchQuery({
      query: gql`
        query GetRessources {
          allEnvironnementsInApplication {
            value: code
          }
          allApplications {
            value: code
            codeOrg: codeOrganisation
            codeEnv: codeEnvironnement
          }
          allGammes {
            value: code
          }
          allSitesCNP {
            value: code
          }
          allServers {
            value: code
            actif
          }
          allParametresDistribution {
            value: reference
            logicielDistribution
          }
        }
      `,
      fetchPolicy: 'no-cache',
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
    }).valueChanges;
  }

  public getRessourcesGamSitRes(query: SearchRessourceByEnvOrgAppProfilInput) {
    return this.apollo.watchQuery<GetRessourcesGamSitResResult>({
      query: gql`
        query GetRessourcesGamSitRes($query: SearchRessourceByEnvOrgAppProfilQuery!) {
          getRessourcesGamSitRes(query: $query) {
            codgam
            codsit
            codres
          }
        }
      `,
      variables: { query },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
