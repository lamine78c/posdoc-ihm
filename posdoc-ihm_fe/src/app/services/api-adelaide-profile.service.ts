import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Gamme } from '@app/models/Gamme';
import { Profile } from '@app/models/profile';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideProfileService {
  constructor(private apollo: Apollo) {}

  public getProfileById(id: string) {
    return this.apollo.watchQuery({
      query: gql`
        query getProfileById($id: String!) {
          profile(id: $id) {
            profile
            libelleProfile
            habilitations {
              id
              parentId
              habilitationType
              identite
            }
          }
        }
      `,
      variables: {
        id: id,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createProfile(createProfile: Profile) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($createProfile: CreateProfileInput!) {
          createProfile(createProfile: $createProfile) {
            profile
            libelleProfile
          }
        }
      `,
      variables: {
        createProfile: createProfile,
      },
      fetchPolicy: 'no-cache',
    });
  }

  saveProfile(updateProfile: Profile) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateProfile: UpdateProfileInput!) {
          updateProfile(updateProfile: $updateProfile) {
            profile
            libelleProfile
          }
        }
      `,
      variables: {
        updateProfile: updateProfile,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteProfile(id: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($id: String!) {
          deleteProfile(deleteProfile: { id: $id }) {
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

  public deleteGammes(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteGammes(deleteGammes: { ids: $ids }) {
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

  public saveGammes(gammes: Gamme[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($gammes: [UpdateGammeInput]!) {
          updateGammes(updateGammes: { gammes: $gammes }) {
            code
            libelle
            codeVerrou
          }
        }
      `,
      variables: {
        gammes: gammes,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getProfileList() {
    return this.apollo.watchQuery({
      query: gql`
        query GetProfiles {
          allProfiles {
            profile
            libelleProfile
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
