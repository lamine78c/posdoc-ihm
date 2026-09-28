import { Injectable } from '@angular/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { Observable } from 'rxjs';
import {
  CreateFaqExchangeResponse,
  CreateFaqResponse,
  IncreaseViewCountResponse,
  SearchAllFaqResponse,
  SearchFaqByPathResponse,
  SearchFaqByUserIdResponse,
  UpdateFaqResponse,
} from '@app/models/faq-conversation';
import { ApolloQueryResult } from '@apollo/client/core';
import { GetNotificationInterface } from '@app/models/notification';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideFaqService {
  constructor(private apollo: Apollo) {}

  public searchFaqByPath(path: string): Observable<ApolloQueryResult<SearchFaqByPathResponse>> {
    return this.apollo.watchQuery<SearchFaqByPathResponse>({
      query: gql`
        query SearchFaqByPath($path: String!) {
          searchFaqByPath(path: $path) {
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
        path: path,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchFaqByUserId(userId: string): Observable<ApolloQueryResult<SearchFaqByUserIdResponse>> {
    return this.apollo.watchQuery<SearchFaqByUserIdResponse>({
      query: gql`
        query SearchFaqByUserId($userId: String!) {
          searchFaqByUserId(userId: $userId) {
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
        userId: userId,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public searchAllFaq(): Observable<ApolloQueryResult<SearchAllFaqResponse>> {
    return this.apollo.watchQuery<SearchAllFaqResponse>({
      query: gql`
        query SearchAllFaq {
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

  public increaseViewCount(id: number): Observable<MutationResult<IncreaseViewCountResponse>> {
    return this.apollo.mutate<IncreaseViewCountResponse>({
      mutation: gql`
        mutation IncreaseViewCount($id: Int!) {
          increaseViewCount(id: $id) {
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
      },
    });
  }

  public createFaqExchange(message: string, faqId: number): Observable<MutationResult<CreateFaqExchangeResponse>> {
    return this.apollo.mutate<CreateFaqExchangeResponse>({
      mutation: gql`
        mutation CreateFaqExchange($message: String!, $faqId: Int!) {
          createFaqExchange(createFaqExchange: { message: $message, faqId: $faqId }) {
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
        message: message,
        faqId: faqId,
      },
    });
  }

  public createFaq(path: string, question: string, answer: string = ''): Observable<MutationResult<CreateFaqResponse>> {
    return this.apollo.mutate<CreateFaqResponse>({
      mutation: gql`
        mutation CreateFaq($path: String!, $question: String!, $answer: String!) {
          createFaq(createFaq: { path: $path, question: $question, answer: $answer }) {
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
        path: path,
        question: question,
        answer: answer,
      },
    });
  }

  public updateFaq(id: number, path: string, question: string, answer: string = ''): Observable<MutationResult<UpdateFaqResponse>> {
    return this.apollo.mutate<UpdateFaqResponse>({
      mutation: gql`
        mutation UpdateFaq($id: Int!, $path: String!, $question: String!, $answer: String!) {
          updateFaq(id: $id, faq: { path: $path, question: $question, answer: $answer }) {
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
        path: path,
        question: question,
        answer: answer,
      },
    });
  }

  public getNotificationsCount() {
    return this.apollo.watchQuery<GetNotificationInterface>({
      query: gql`
        query getNotification {
          getNotification {
            id
            recipientId
            faq {
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
            }
            createdAt
          }
        }
      `,
      fetchPolicy: 'no-cache',
      context: {
        headers: {
          'no-spinner': 'true'
        }
      }
    }).valueChanges;
  }
}
