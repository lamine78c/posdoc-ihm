import { Apollo } from 'apollo-angular';
import { InvalidationEtapePayload } from '../models/invalidation-etape-models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiInvalidationEtapeService {
  constructor(private apollo: Apollo) {}

  invalideGenEtpEtLiens(payload: InvalidationEtapePayload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation invalideGenEtpEtLiens($payload: InvalideGenEtpPayload) {
            invalideGenEtpEtLiens(payload: $payload) {
              erreur
            }
          }
        `,
        variables: {
          payload: payload,
        },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        catchError(error => {
          console.error("Erreur lors de l'invalidation de l'étape: ", error);
          return throwError(error);
        })
      );
  }
}
