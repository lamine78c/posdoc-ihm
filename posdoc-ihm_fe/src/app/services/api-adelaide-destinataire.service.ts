import { Injectable } from '@angular/core';
import { Destinataire } from '@app/models/destinataire';
import { DestinataireId } from '@app/models/destinataireId';
import { DestinataireToAddExemplaireInterface } from '@app/models/exploitation-editique/reedition/reedition-ressource/destinataire-to-add-exemplaire';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideDestinataireService {
  constructor(private apollo: Apollo) {}

  public getAllDestinataires() {
    return this.apollo.watchQuery({
      query: gql`
        query GetDestinataires {
          allDestinataires {
            code
            codeOrg
            libelle
            refPri
            isNotAuthorisedToBeDeleted
          }
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  // createDestinataires: { destinataires : [ {code:"zbc", codeOrg:"010", libelle:"zbc", refPri:""}, ... ] }
  public createDestinataires(destinataires: Destinataire[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation create($destinataires: [CreateOrUpdateDestinataireInput]!) {
          createDestinataires(createDestinataires: { destinataires: $destinataires }) {
            code
            codeOrg
            libelle
            refPri
          }
        }
      `,
      variables: {
        destinataires: destinataires,
      },
      fetchPolicy: 'no-cache',
    });
  }

  // updateDestinataire: { code:"zbc", codeOrg:"010", libelle:"zcz", refPri:"" }
  public updateDestinataire(updateDestinataire: Destinataire) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($updateDestinataire: CreateOrUpdateDestinataireInput!) {
          updateDestinataire(updateDestinataire: $updateDestinataire) {
            code
            codeOrg
            libelle
            refPri
          }
        }
      `,
      variables: {
        updateDestinataire: updateDestinataire,
      },
      fetchPolicy: 'no-cache',
    });
  }

  // deleteDestinataires: {ids: [{code: "aa", codeOrg: "aa"}, {code: "bb", codeOrg: "bb"}]}
  public deleteDestinataires(ids: DestinataireId[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeleteDestinataireInput]!) {
          deleteDestinataires(deleteDestinataires: { ids: $ids }) {
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

  public getDestinatairesToAddNewExemplaire(codeOrg: string) {
    return this.apollo.watchQuery<DestinataireToAddExemplaireInterface>({
      query: gql`
        query GetDestinatairesToAddNewExemplaire($codeOrg: String) {
          getDestinatairesToAddNewExemplaire(codeOrg: $codeOrg) {
            code
            text
          }
        }
      `,
      variables: {
        codeOrg: codeOrg,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDestinatairesByOrgs(orgs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDestinatairesByOrgs($orgs: [String]) {
          getDestinatairesByOrgs(orgs: $orgs)
        }
      `,
      variables: {
        orgs: orgs,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getConfigDestinataire() {
    return this.apollo.watchQuery({
      query: gql`
        query getConfigDestinataire {
          findAllCodeDestinsAndCodeOrg {
            code
            codeOrg
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
