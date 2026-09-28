import { Injectable } from '@angular/core';
import { Contenu } from '@app/models/contenu';
import {
  AideInterface,
  ChangeStateHelpResponse,
  ContenuForAccueilInterface,
  CreateAideResponse,
  PathCompletInterface,
  UpdateAideResponse,
} from '@app/models/contenu-for-accueil';
import { CreateFaqResponse, DeleteFaqResponse, FaqInterface, UpdateFaqResponse, UpdateStatusResponse } from '@app/models/faq-conversation';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideContenuService {
  constructor(private apollo: Apollo) {}

  public getAllContenu() {
    return this.apollo.watchQuery({
      query: gql`
        query GetContenus {
          allContenus {
            id
            titre
            dateActivation
            dateExpiration
            message
            regions {
              code
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getContenusForAccueil(userOrganismes: string[]) {
    return this.apollo.watchQuery<ContenuForAccueilInterface>({
      query: gql`
        query getContenusForAccueil($userOrganismes: [String]) {
          getContenusForAccueil(userOrganismes: $userOrganismes) {
            titre
            message
            regions
          }
        }
      `,
      variables: {
        userOrganismes: userOrganismes,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createContenu(createContenu: Contenu) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createContenu: CreateOrUpdateContenuInputDTO!) {
          createContenu(createContenu: $createContenu) {
            id
            titre
            dateActivation
            dateExpiration
            message
            regions {
              code
            }
          }
        }
      `,
      variables: {
        createContenu: createContenu,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteContenu(id: number) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($id: Int!) {
          deleteContenu(deleteContenu: $id) {
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

  public getAllAides() {
    return this.apollo.watchQuery<AideInterface>({
      query: gql`
        query SearchAll {
          searchAll {
            id
            path
            message
            state
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createAide(helpPayload: { path: string; message: string }) {
    return this.apollo.mutate<CreateAideResponse>({
      mutation: gql`
        mutation Create($helpPayload: HelpCreatePayload!) {
          createHelp(help: $helpPayload) {
            id
            path
            message
            state
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
        }
      `,
      variables: {
        helpPayload: helpPayload,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateAide(helpPayload: { id: number; message: string }) {
    return this.apollo.mutate<UpdateAideResponse>({
      mutation: gql`
        mutation Update($helpPayload: HelpUpdatePayload!) {
          updateHelp(help: $helpPayload) {
            id
            path
            message
            state
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
        }
      `,
      variables: {
        helpPayload: helpPayload,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteAide(id: number) {
    return this.apollo.mutate({
      mutation: gql`
        mutation Delete($id: Int!) {
          deleteHelp(id: $id) {
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

  public changeStateHelp(id: number) {
    return this.apollo.mutate<ChangeStateHelpResponse>({
      mutation: gql`
        mutation ChangeState($id: Int!) {
          changeStateHelp(id: $id) {
            id
            path
            message
            state
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
        }
      `,
      variables: {
        id: id,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getAllPathComplet() {
    return this.apollo.watchQuery<PathCompletInterface>({
      query: gql`
        query getAllPathComplet {
          getAllPathComplet {
            path
            libelle
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchAllFaq() {
    return this.apollo.watchQuery<FaqInterface>({
      query: gql`
        query searchAllFaq {
          searchAllFaq {
            id
            path
            question
            answer
            status
            viewCount
            createdBy
            updatedBy
            createdAt
            updatedAt
            exchanges {
              id
              author
              message
              createdAt
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createFaq(createFaq: { path: string; question: string; answer: string }) {
    return this.apollo.mutate<CreateFaqResponse>({
      mutation: gql`
        mutation createFaq($createFaq: CreateOrUpdateFaqInputDTO!) {
          createFaq(createFaq: $createFaq) {
            id
            path
            question
            answer
            status
            viewCount
            createdBy
            updatedBy
            createdAt
            updatedAt
            exchanges {
              id
              author
              message
              createdAt
            }
          }
        }
      `,
      variables: {
        createFaq: createFaq,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateFaqStatus(id: number, status: string) {
    return this.apollo.mutate<UpdateStatusResponse>({
      mutation: gql`
        mutation updateStatus($id: Int!, $status: String!) {
          updateStatus(id: $id, status: $status) {
            id
            path
            question
            answer
            status
            viewCount
            createdBy
            updatedBy
            createdAt
            updatedAt
            exchanges {
              id
              author
              message
              createdAt
            }
          }
        }
      `,
      variables: {
        id: id,
        status: status,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateFaq(id: number, updateFaq: { path: string; question: string; answer: string }) {
    return this.apollo.mutate<UpdateFaqResponse>({
      mutation: gql`
        mutation updateFaq($id: Int!, $faq: CreateOrUpdateFaqInputDTO!) {
          updateFaq(id: $id, faq: $faq) {
            id
            path
            question
            answer
            status
            viewCount
            createdBy
            updatedBy
            createdAt
            updatedAt
            exchanges {
              id
              author
              message
              createdAt
            }
          }
        }
      `,
      variables: {
        id: id,
        faq: updateFaq,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteFaq(id: number) {
    return this.apollo.mutate<DeleteFaqResponse>({
      mutation: gql`
        mutation deleteFaq($id: Int!) {
          deleteFaq(id: $id) {
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
}
