import { Injectable } from '@angular/core';
import { Papaad, PapaadIds } from '@app/models/papaad';
import { CreatePapaadInterface } from '@app/produit/papaad/model/papaad';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaidePapaadService {
  constructor(private apollo: Apollo) {}

  public getAllPapaad() {
    return this.apollo.watchQuery({
      query: gql`
        query GetPapaads {
          allPapaads {
            codeCommande
            codeFichier
            codeNotif
            libelle
            periode
            codeRND
            appPro
            typeHas
            format
            isUrib
            nsTruc
            imprime
            huissier
            numNot
            strRaf
            contrat
            medele
            idtbcc
          }
          getAllDistinctCodComCodFicCodPrd {
            codeCom
            codeFic
            codePrd
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createPapaad(createPapaad: Papaad) {
    return this.apollo.mutate<CreatePapaadInterface>({
      mutation: gql`
        mutation create($createPapaad: CreatePapaadInput!) {
          createPapaad(createPapaad: $createPapaad) {
            codeCommande
            codeFichier
            codeNotif
            libelle
            periode
            codeRND
            appPro
            typeHas
            format
            isUrib
            nsTruc
            imprime
            huissier
            numNot
            strRaf
            contrat
            medele
            idtbcc
          }
        }
      `,
      variables: {
        createPapaad: createPapaad,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updatePapaad(updatePapaad: Papaad) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updatePapaad: UpdatePapaadInput!) {
          updatePapaad(updatePapaad: $updatePapaad) {
            codeCommande
            codeFichier
            codeNotif
            libelle
            periode
            codeRND
            appPro
            typeHas
            format
            isUrib
            nsTruc
            imprime
            huissier
            numNot
            strRaf
            contrat
            medele
            idtbcc
          }
        }
      `,
      variables: {
        updatePapaad: updatePapaad,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deletePapaads(ids: PapaadIds[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeletePapaadInput]!) {
          deletePapaads(deletePapaads: { ids: $ids }) {
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
