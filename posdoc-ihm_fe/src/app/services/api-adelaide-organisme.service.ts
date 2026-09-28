import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Organisme } from '../admin/organisme/organismes/organismes.component';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideOrganismeService {
  constructor(private apollo: Apollo) {}

  public getCodesOrganismesByRegions(regions?: string[]) {
    return this.apollo.watchQuery<Organisme>({
      query: gql`
        query GetCodesOrganismesByRegions($regions: [String]) {
          getCodesOrganismesByRegions(regions: $regions)
        }
      `,
      variables: {
        regions: regions,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllOrganismes() {
    return this.apollo.watchQuery({
      query: gql`
        query getAllOrganismes {
          allOrganismes {
            code
            libelle
            adresse1
            adresse2
            adresse3
            adresse4
            type
            codeRegion
            codeSite
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllOrganismesShort() {
    return this.apollo.watchQuery({
      query: gql`
        query getAllOrganismes {
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

  public getOrganismes() {
    return this.apollo.watchQuery({
      query: gql`
        query GetOrganismes {
          allOrganismes {
            code
            libelle
            adresse1
            adresse2
            adresse3
            adresse4
            type
            codeRegion
            codeSite
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createOrganisme(createOrganisme: Organisme) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createOrganisme: CreateOrUpdateOrganismeInput!) {
          createOrganisme(createOrganisme: $createOrganisme) {
            code
            libelle
            adresse1
            adresse2
            adresse3
            adresse4
            type
            codeRegion
            codeSite
          }
        }
      `,
      variables: {
        createOrganisme: createOrganisme,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateOrganisme(updateOrganisme: Organisme) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateOrganisme: CreateOrUpdateOrganismeInput!) {
          updateOrganisme(updateOrganisme: $updateOrganisme) {
            code
            libelle
            adresse1
            adresse2
            adresse3
            adresse4
            type
            codeRegion
            codeSite
          }
        }
      `,
      variables: {
        updateOrganisme: updateOrganisme,
      },
      fetchPolicy: 'no-cache',
    });
  }
  public deleteOrganismes(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteOrganismes(deleteOrganismes: { ids: $ids }) {
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
          allRegions {
            code
          }
          allSitesCNP {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
