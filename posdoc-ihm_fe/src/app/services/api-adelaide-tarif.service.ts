import { Injectable } from '@angular/core';
import { AllTarifsInterface, CreateTarifInput, Tarif, TarifDetail, Tarpos, TarposDetails, UpdateTarifInput } from '@app/models/tarif';
import { Creteria } from '@app/models/utils/creteria';
import { SortInput } from '@app/models/utils/sortInput';
import { Apollo, gql } from 'apollo-angular';
import { DeleteTarif } from '@app/models/deleteTarif';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideTarifService {
  constructor(private apollo: Apollo) {}

  public getTarif(page: number, size: number, sort: SortInput, criteria: Creteria[]) {
    return this.apollo.watchQuery({
      query: gql`
        query getTarifs($page: Int!, $size: Int!, $sort: [SortInput]!, $criteria: [FilterCriterionInput]!) {
          tarifs(queryParameters: { paginationParameters: { page: $page, size: $size, sort: $sort }, filterCriteria: { criteria: $criteria } }) {
            totalElement
            totalPages
            elements {
              ... on Tarif {
                type
                numero
                dateDebut
                dateFin
                coutPli
                urgent
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

  public getAllTarifs() {
    return this.apollo.watchQuery<AllTarifsInterface>({
      query: gql`
        query GetTarifs {
          allTarifs {
            type
            numero
            dateDebut
            dateFin
            coutPli
            urgent
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAllTarpos() {
    return this.apollo.watchQuery<TarposDetails>({
      query: gql`
        query GetTarifs {
          allTarpos {
            type
            ordre
            libelle
            tlibre
            compta
            perime
            isNotAuthorisedToBeDeleted
            tarifs {
              type
              numero
              dateDebut
              dateFin
              coutPli
              urgent
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createTarpos(createTarpos: Tarpos) {
    return this.apollo.mutate({
      mutation: gql`
        mutation createTarpos($createTarpos: TarposInput!) {
          createTarpos(createTarpos: $createTarpos) {
            type
            ordre
            libelle
            tlibre
            compta
            perime
          }
        }
      `,
      variables: {
        createTarpos: createTarpos,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateTarpos(updateTarpos: Tarpos) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateTarpos($updateTarpos: TarposInput!) {
          updateTarpos(updateTarpos: $updateTarpos) {
            type
            ordre
            libelle
            tlibre
            compta
            perime
          }
        }
      `,
      variables: {
        updateTarpos: updateTarpos,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteTarpos(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation deleteAllTarpos($ids: [String]!) {
          deleteAllTarpos(deleteAllTarpos: { ids: $ids }) {
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

  public createTarif(createTarif: Tarif) {
    return this.apollo.mutate<CreateTarifInput>({
      mutation: gql`
        mutation create($createTarif: CreateTarifInput!) {
          createTarif(createTarif: $createTarif) {
            type
            dateDebut
            dateFin
            coutPli
            urgent
          }
        }
      `,
      variables: {
        createTarif: createTarif,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateTarif(updateTarif: Tarif) {
    return this.apollo.mutate<UpdateTarifInput>({
      mutation: gql`
        mutation update($updateTarif: UpdateTarifInput!) {
          updateTarif(updateTarif: $updateTarif) {
            type
            numero
            dateDebut
            dateFin
            coutPli
            urgent
          }
        }
      `,
      variables: {
        updateTarif: updateTarif,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteTarifs(deleteTarifs: DeleteTarif[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($deleteTarifs: [DeleteTarifInput]!) {
          deleteTarifs(deleteTarifs: $deleteTarifs) {
            ok
          }
        }
      `,
      variables: {
        deleteTarifs: deleteTarifs,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getTarifByType(type: string) {
    return this.apollo.watchQuery<TarifDetail>({
      query: gql`
        query getTarifsById($type: String!) {
          getTarifsById(type: $type) {
            type
            numero
            dateDebut
            dateFin
            coutPli
            urgent
          }
        }
      `,
      variables: {
        type: type,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
