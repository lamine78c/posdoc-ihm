import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { OccurrenceFichier, OccurrencesFichiersFilters } from '@app/models/suivi/occurrence-fichier.model';

export interface OccurrenceFichierResultInterface {
  getOccurrencesFichiers: {
    occurrencesFichiers: OccurrenceFichier[];
    message?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiOccurrenceFichierService {
  private readonly apollo = inject(Apollo);

  /**
   * Récupère les occurrences de fichiers depuis la base de données avec filtres obligatoires
   */
  getOccurrencesFichiers(filtersPayload: OccurrencesFichiersFilters) {
    return this.apollo.watchQuery<OccurrenceFichierResultInterface>({
      query: gql`
        query GetOccurrencesFichiers($filtersPayload: OccurrencesFichiersFiltersInput!) {
          getOccurrencesFichiers(filtersPayload: $filtersPayload) {
            occurrencesFichiers {
              codenv
              codorg
              codapp
              percod
              codcom
              codfic
              numcom
              codprd
              ficsta
              ficinf
              frefec
              ficvid
              dappcr
              dfichd
              dficht
            }
            message
          }
        }
      `,
      variables: {
        filtersPayload: filtersPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

}
