import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

import { Region } from '../models/region';
import { Creteria } from '../models/utils/creteria';
import { SortInput } from '../models/utils/sortInput';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideRegionService {
  constructor(private apollo: Apollo) {}

  public getRegion(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetRegions($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          regions(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Region {
                code
                libelle
              }
            }
          }
        }
      `,
      variables: {
        page: page,
        size: size,
        sort: sort,
        criteria: criteria,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllRegions() {
    return this.apollo.watchQuery<AllRegionsInterface>({
      query: gql`
        query GetRegions {
          allRegions {
            code
            libelle
            isNotAuthorisedToBeDeleted
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createRegion(createRegion: Region) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createRegion: CreateOrUpdateRegionInput!) {
          createRegion(createRegion: $createRegion) {
            code
            libelle
          }
        }
      `,
      variables: {
        createRegion: createRegion,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateRegion(updateRegion: Region) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateRegion: CreateOrUpdateRegionInput!) {
          updateRegion(updateRegion: $updateRegion) {
            code
            libelle
          }
        }
      `,
      variables: {
        updateRegion: updateRegion,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteRegion(id: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($id: String!) {
          deleteRegion(deleteRegion: { id: $id }) {
            ok
          }
        }
      `,
      variables: {
        id: id,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteRegions(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteRegions(deleteRegions: { ids: $ids }) {
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
}
