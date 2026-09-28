import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { ValidationEtapePayload } from '../models/validation-etape-models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiValidationEtapeService {
  constructor(private apollo: Apollo) {}

  valideEtape(payload: ValidationEtapePayload[]) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation valideGenEtp($payload: [ValideGenEtpPayload]) {
            valideGenEtp(payload: $payload) {
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
          console.error("Erreur lors de la validation de l'étape: ", error);
          return throwError(error);
        })
      );
  }
}
