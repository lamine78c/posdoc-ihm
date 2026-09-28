import { Injectable } from '@angular/core';
import {
  CreateServiceInterface,
  CreateUpdateServiceInput,
  FindAllServicesInterface,
  UpdateServiceInterface,
} from '@app/admin/service/model/service.interface';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideServicePosdocService {
  constructor(private apollo: Apollo) {}

  public getAllServices() {
    return this.apollo.watchQuery<FindAllServicesInterface>({
      query: gql`
        query findAllServices {
          findAllServices {
            id
            libelle
            url
            createdAt
            updatedAt
            createdBy
            updatedBy
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

  public createService(serviceInput: CreateUpdateServiceInput) {
    return this.apollo.mutate<CreateServiceInterface>({
      mutation: gql`
        mutation createServicePosdoc($serviceInput: ServicePosdocInput!) {
          createServicePosdoc(createService: $serviceInput) {
            id
            libelle
            url
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
        }
      `,
      variables: {
        serviceInput: serviceInput,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateService(serviceInput: CreateUpdateServiceInput) {
    return this.apollo.mutate<UpdateServiceInterface>({
      mutation: gql`
        mutation updateServicePosdoc($serviceInput: ServicePosdocInput!) {
          updateServicePosdoc(updateService: $serviceInput) {
            id
            libelle
            url
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
        }
      `,
      variables: {
        serviceInput: serviceInput,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteServices(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation deleteServicesPosdoc($ids: [String]!) {
          deleteServicesPosdoc(deleteServices: { ids: $ids }) {
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

  public checkServiceHealth(url: string) {
    return this.apollo.query({
      query: gql`
        query checkServiceHealth($url: String!) {
          checkServiceHealth(url: $url)
        }
      `,
      variables: {
        url: url,
      },
      fetchPolicy: 'no-cache',
      context: {
        headers: {
          'no-spinner': 'true'
        }
      }
    });
  }
}
