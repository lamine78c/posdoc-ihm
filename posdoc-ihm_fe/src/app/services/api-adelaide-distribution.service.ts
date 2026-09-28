import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Exemplaire } from '@app/models/exemplaire';
import {
  CreateExemplairesInterface,
  DestinatairesInterface,
  ParamsEnvOrgsAppInterface,
  RessourceDataInterface,
  RessourcesInterface,
  UpdateExemplairesInterface,
  UpdateMasseExemplairesInterface,
} from '@app/models/gestion-fichier-edition/parametre-edition/params-env-orgs-app-interface';
import { SearchByEnvOrgsAppComFicQuery } from '@app/models/payload/search-by-env-orgs-app-com-fic';
import { ExemplaireByFilterQuery, GetPreselectedDataInterface } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { Apollo, gql } from 'apollo-angular';
import { DistFicByEnvOrgAppComFromExemplaireInterface } from '@app/models/fichier';
import { SearchExemplaireByResourceQuery } from '@app/models/payload/search-exemplaire-by-resource';
import { ExemplaireByResourceInterface } from '@app/models/exemplaire-by-resource';
import { DeleteExemplaire } from '@app/models/deleteExemplaire';
import { AsyncApiParametresEdition } from '@app/models/asyncApiParametresEdition';
import {
  FindOrganismesToCompleteInput,
  FindOrganismesToCompleteResult,
} from '@app/produit/distribution/parametre-edition/popup/modal-component/model/find-organisme-to-complete-input';
import { SearchByEnvOrgAppComFicQuery } from '@app/models/payload/search-by-env-org-app-com-fic';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideDistributionService {
  constructor(private apollo: Apollo) {}

  public getAsyncAPIsForParametreEdition() {
    return this.apollo.watchQuery<AsyncApiParametresEdition>({
      query: gql`
        query AsyncAPIsForParametreEdition {
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
          allRessources {
            codeRessource
            libelle
            codeEnvironnement
            codeApplication
            codeOrganisme
            codeGamme
            codeSite
            profil
          }
          allDestinataires {
            code
            libelle
            codeOrg
          }
          allSitesCNP {
            code
          }
          getCodeOrgOGUR
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getPreselectedData(query: ExemplaireByFilterQuery) {
    return this.apollo.watchQuery<GetPreselectedDataInterface>({
      query: gql`
        query GetPreselectedExemplaire($query: ExemplaireByFilterQuery) {
          getPreselectedExemplaire(query: $query) {
            codenv
            codorg
            codapp
            codcom
            exeact
            nbrexe
            coddes
            codres
            codfic
            codgam
            numexe
            codsit
            codeProd
            refImprime
            libFichier
            isAdmin
            ficatt
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctEnvsFromExemplaire() {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistinctEnvsFromExemplaire {
          getDistinctEnvsFromExemplaire
        }
      `,
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctOrgsByEnvs(codenvs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistOrgByEnvFromExemplaire($codenvs: [String]) {
          getDistOrgByEnvFromExemplaire(codenvs: $codenvs)
          allOrganismes {
            code
            libelle
            codeRegion
          }
        }
      `,
      variables: {
        codenvs: codenvs,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistAppsByEnvOrg(codenvs: string[], codorgs: string[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetDistAppByEnvOrgFromExemplaire($codenvs: [String], $codorgs: [String]) {
          getDistAppByEnvOrgFromExemplaire(codenvs: $codenvs, codorgs: $codorgs)
        }
      `,
      variables: {
        codenvs: codenvs,
        codorgs: codorgs,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistComsByEnvOrgApp(codenvs: string[], codorgs: string[], codapp: string) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistComByEnvOrgAppFromExemplaire($codenvs: [String], $codorgs: [String], $codapp: String) {
          getDistComByEnvOrgAppFromExemplaire(codenvs: $codenvs, codorgs: $codorgs, codapp: $codapp)
        }
      `,
      variables: {
        codenvs: codenvs,
        codorgs: codorgs,
        codapp: codapp,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistFicsByEnvOrgAppCom(query: ExemplaireByFilterQuery) {
    return this.apollo.watchQuery<DistFicByEnvOrgAppComFromExemplaireInterface>({
      query: gql`
        query getDistFicByEnvOrgAppComFromExemplaire($query: ExemplaireByFilterQuery) {
          getDistFicByEnvOrgAppComFromExemplaire(query: $query) {
            codfic
            refImprime
            codeProd
          }
        }
      `,
      variables: {
        query: query,
      },
      context: { headers: new HttpHeaders().set('no-spinner', 'true') },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDistRessourceByEnvOrgAppComFic(query: ExemplaireByFilterQuery) {
    return this.apollo.watchQuery({
      query: gql`
        query getDistRessourceByEnvOrgAppComFicFromExemplaire($query: ExemplaireByFilterQuery) {
          getDistRessourceByEnvOrgAppComFicFromExemplaire(query: $query) {
            codgam
            codsit
            codres
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getAPIsForCompleteParametreEdition(input: FindOrganismesToCompleteInput) {
    return this.apollo.watchQuery<FindOrganismesToCompleteResult>({
      query: gql`
        query findExemplaireOrganismeToComplete($input: FindOrganismesToCompleteInput) {
          findExemplaireOrganismeToComplete(input: $input)
          allOrganismes {
            code
            codeRegion
          }
        }
      `,
      variables: {
        input: input,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public createExemplaire(createExemplaire: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation createExemplaire($createExemplaire: CreateOrUpdateExemplaireInput!) {
          createExemplaire(createExemplaire: $createExemplaire) {
            codenv
            codorg
            codapp
            codcom
            codfic
            codgam
            numexe
            codsit
            codres
            coddes
            nbrexe
            exeact
          }
        }
      `,
      variables: {
        createExemplaire: createExemplaire,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateExemplaire(updateExemplaire: any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateExemplaire($updateExemplaire: CreateOrUpdateExemplaireInput!) {
          updateExemplaire(updateExemplaire: $updateExemplaire) {
            codenv
            codorg
            codapp
            codcom
            exeact
            nbrexe
            coddes
            codres
            codfic
            codgam
            numexe
            codsit
          }
        }
      `,
      variables: {
        updateExemplaire: updateExemplaire,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteExemplaire(id: any) {
    return this.apollo.mutate<DeleteExemplaire>({
      mutation: gql`
        mutation delete($id: DeleteExemplaireInput!) {
          deleteExemplaire(deleteExemplaire: $id) {
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

  public createExemplaires(exemplaires: any[], message: string) {
    return this.apollo.mutate<CreateExemplairesInterface>({
      mutation: gql`
        mutation create($exemplaires: [CreateOrUpdateExemplaireInput]!, $message: String) {
          createExemplaires(createExemplaires: { exemplaires: $exemplaires }, message: $message) {
            codenv
            codorg
            codapp
            codcom
            exeact
            nbrexe
            coddes
            codres
            codfic
            codgam
            numexe
            codsit
          }
        }
      `,
      variables: {
        exemplaires: exemplaires,
        message: message,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateExemplaires(exemplaires: any[]) {
    return this.apollo.mutate<UpdateExemplairesInterface>({
      mutation: gql`
        mutation update($exemplaires: [CreateOrUpdateExemplaireInput]!) {
          updateExemplaires(updateExemplaires: { exemplaires: $exemplaires }) {
            codenv
            codorg
            codapp
            codcom
            exeact
            nbrexe
            coddes
            codres
            codfic
            codgam
            numexe
            codsit
          }
        }
      `,
      variables: {
        exemplaires: exemplaires,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public deleteExemplaires(ids: any[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [DeleteExemplaireInput]!) {
          deleteExemplaires(deleteExemplaires: { ids: $ids }) {
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

  public getAllOrganismes() {
    return this.apollo.watchQuery({
      query: gql`
        query allOrganismes {
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

  getRessourcesByCodeEnvOrgsApp(payload: ParamsEnvOrgsAppInterface) {
    return this.apollo.watchQuery<RessourcesInterface>({
      query: gql`
        query getRessourcesByCodeEnvOrgsApp($payload: CodeEnvOrgsAppPayload!) {
          getRessourcesByCodeEnvOrgsApp(payload: $payload) {
            codgam
            codsit
            codres
          }
        }
      `,
      variables: {
        payload: payload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getCodeDestinatairesByCodeOrgs(codorgs: string[]) {
    return this.apollo.watchQuery<DestinatairesInterface>({
      query: gql`
        query getCodeDestinatairesByCodeOrgs($codorgs: [String]!) {
          getCodeDestinatairesByCodeOrgs(codorgs: $codorgs)
        }
      `,
      variables: {
        codorgs: codorgs,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public updateMasseExemplaires(ressourcePayload: RessourceDataInterface, exemplaires: Exemplaire[]) {
    return this.apollo.mutate<UpdateMasseExemplairesInterface>({
      mutation: gql`
        mutation updateMasseExemplaires($ressourcePayload: RessourcePayloadInput!, $exemplaires: [UpdateMasseExemplaireInput]!) {
          updateMasseExemplaires(ressourcePayload: $ressourcePayload, exemplaires: $exemplaires) {
            codenv
            codorg
            codapp
            codcom
            exeact
            nbrexe
            coddes
            codres
            codfic
            codgam
            numexe
            codsit
          }
        }
      `,
      variables: {
        ressourcePayload: ressourcePayload,
        exemplaires: exemplaires,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateMessageFichierByIdsFichier(ids: SearchByEnvOrgAppComFicQuery[], message: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($ids: [FichierComposite], $message: String) {
          updateFicAttByIds(ids: $ids, message: $message)
        }
      `,
      variables: {
        ids: ids,
        message: message,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public updateMessageFichierByExemplaires(query: SearchByEnvOrgsAppComFicQuery, message: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($query: SearchByEnvOrgsAppComFicQuery!, $message: String) {
          updateFicAttByEnvOrgsAppComFic(query: $query, message: $message)
        }
      `,
      variables: {
        query: query,
        message: message,
      },
      fetchPolicy: 'no-cache',
    });
  }

  public getExemplairesByRessource(query: SearchExemplaireByResourceQuery) {
    return this.apollo.watchQuery<ExemplaireByResourceInterface>({
      query: gql`
        query getExemplairesByRessource($query: ExemplaireByRessourceQuery) {
          getExemplairesByRessource(query: $query) {
            codenv
            codorg
            codapp
            codcom
            codfic
            message
            ressources {
              exemplaireExists
              codgam
              codres
              codsit
              codorg
              etat
              coddes
              hasProfil
            }
          }
          allOrganismes {
            code
            codeRegion
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
