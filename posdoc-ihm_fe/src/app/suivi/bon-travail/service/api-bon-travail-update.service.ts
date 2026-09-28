import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { BonTravailUpdateInput, UserInfoInput } from '../model/bon-travail-update-models';

@Injectable({
  providedIn: 'root',
})
export class ApiBonTravailUpdateService {
  constructor(private apollo: Apollo) {}

  updateBonTravail(updateBonTravail: BonTravailUpdateInput[], userInfo: UserInfoInput) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateBonTravail($updateBonTravail: [BonTravailUpdateInput], $userInfo: UserInfoInput) {
          updateBonTravail(updateBonTravail: $updateBonTravail, userInfo: $userInfo) {
            codenv
            codorg
            codapp
            percod
            codcom
            codfic
            numcom
            drecep
            dfiexp
            inform
            delmsp
          }
        }
      `,
      variables: {
        updateBonTravail: updateBonTravail,
        userInfo: userInfo,
      },
      fetchPolicy: 'no-cache',
    });
  }
}
