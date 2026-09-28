import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { OccurrenceEtapeInputInterface, SearchOccurrenceEtapeInterface } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { DinstinctEnvOrgAppGenetpInterface } from '@app/models/supervision/production/distinct-en-org-app-genetp-interface';
import {
  DistinctGamsAndComsByEnvsAndOrgsAndAppsAndPercodsInterface,
  OccurrenceEtapeSearchDataInterface,
  VideoStepInput,
  VideoStepInterface,
} from '@app/models/supervision/video-step-interface';
import { AllStainfIntreface } from '@app/models/supervision/production/details/stainf-intreface';
import {
  VideoStepDetailsFichierInterface,
  VideoStepDetailsFichierModel,
} from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ValideOrInvalideGenEtpPayload } from '@app/supervision/production/occurrence-etape/models/validation-etape-models';

@Injectable({
  providedIn: 'root',
})
export class ApiGestionOccurrenceEtapeService {
  constructor(private apollo: Apollo) {}

  getOccurrenceEtapeData(occurrenceEtapePayload: any) {
    return this.apollo.watchQuery<SearchOccurrenceEtapeInterface>({
      query: gql`
        query searchOccurrenceEtape($occurrenceEtapePayload: OccurrenceEtapePayload!) {
          searchOccurrenceEtape(occurrenceEtapePayload: $occurrenceEtapePayload) {
            id
            typetp
            codenv
            codorg
            codapp
            percod
            codcom
            numcom
            codfic
            codgam
            numexe
            codres
            codsit
            coddes
            nbrexe
            codser
            codsig
            signal
            reedit
            fabsim
            statut
            codinf
            create
            valide
            debute
            termin
            invali
            suspen
            histor
            script
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
        }
      `,
      variables: {
        occurrenceEtapePayload: occurrenceEtapePayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public setNewStatusForListOfGenEtp(etapes: OccurrenceEtapeInputInterface[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation SetNewStatusForListOfGenEtp($etapes: [OccurrenceEtapeInput]) {
          setNewStatusForListOfGenEtp(etapes: $etapes) {
            id
            statut
          }
        }
      `,
      variables: {
        etapes: etapes,
      },
      fetchPolicy: 'no-cache',
    });
  }

  getDistinctEnvOrgAppGenetp() {
    return this.apollo.watchQuery<DinstinctEnvOrgAppGenetpInterface>({
      query: gql`
        query findDistinctCodenvCodorgCodapp {
          findDistinctCodenvCodorgCodapp {
            codenv
            codorg
            codapp
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
          allVerrous {
            code
          }
        }
      `,
      variables: {},
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getOccurrenceEtapeSearchData() {
    return this.apollo.watchQuery<OccurrenceEtapeSearchDataInterface>({
      query: gql`
        query GetOccurrenceEtapeSearchData {
          getOccurrenceEtapeSearchData {
            codenv
            codorg
            codapp
          }
          allOrganismes {
            code
            libelle
            codeRegion
            codeSite
          }
        }
      `,
      variables: {},
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public getDistinctGamsAndComsByEnvsAndOrgsAndAppsAndPercods(codenvs: string[], codorgs: string[], codapps: string[], percods: string[]) {
    return this.apollo.watchQuery<DistinctGamsAndComsByEnvsAndOrgsAndAppsAndPercodsInterface>({
      query: gql`
        query GetDistinctGamsAndComsByEnvsAndOrgsAndAppsAndPercods($codenvs: [String], $codorgs: [String], $codapps: [String], $percods: [String]) {
          getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(codenvs: $codenvs, codorgs: $codorgs, codapps: $codapps, percods: $percods)
          getDistinctComsByEnvsAndOrgsAndAppsAndPercods(codenvs: $codenvs, codorgs: $codorgs, codapps: $codapps, percods: $percods)
        }
      `,
      variables: {
        codenvs: codenvs,
        codorgs: codorgs,
        codapps: codapps,
        percods: percods,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getVideoSteps(videoStepPayload: VideoStepInput) {
    return this.apollo.watchQuery<VideoStepInterface>({
      query: gql`
        query GetVideoSteps($videoStepPayload: VideoStepPayload!) {
          getVideoSteps(videoStepPayload: $videoStepPayload) {
            idpere
            idetap
            typetp
            codenv
            codorg
            codapp
            percod
            numcom
            codcom
            codfic
            codgam
            statut
            codinf
            codser
            codsit
            codres
            coddes
            reedit
            etpfus
            script
            idtfus
            numexe
            nbrexe
            codsig
            signal
            fabsim
            create
            valide
            debute
            termin
            invali
            suspen
            histor
            stepno
            numpid
            clefus
          }
        }
      `,
      variables: {
        videoStepPayload: videoStepPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getFirstVideoStep(videoStepPayload: VideoStepInput) {
    return this.apollo.watchQuery<VideoStepInterface>({
      query: gql`
        query GetFirstVideoStep($videoStepPayload: VideoStepPayload!) {
          getFirstVideoStep(videoStepPayload: $videoStepPayload) {
            idetap
            typetp
            codenv
            codorg
            codapp
            percod
            numcom
            codcom
            codfic
            codgam
            statut
            codinf
            codser
            codsit
            codres
            coddes
            reedit
            etpfus
            script
            idtfus
            numexe
            nbrexe
            codsig
            signal
            fabsim
            create
            valide
            debute
            termin
            invali
            suspen
            histor
            stepno
            numpid
            clefus
          }
        }
      `,
      variables: {
        videoStepPayload: videoStepPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getConfigData() {
    return this.apollo.watchQuery<AllStainfIntreface>({
      query: gql`
        query GetConfigData {
          allStaInf {
            statut
            codinf
            libinf
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getVideoStepDetailsFichier(videoStepDetailsFichierPayload: VideoStepDetailsFichierModel) {
    return this.apollo.watchQuery<VideoStepDetailsFichierInterface>({
      query: gql`
        query GetVideoStepDetailsFichier($videoStepDetailsFichierPayload: VideoStepDetailsFichierPayload!) {
          getVideoStepDetailsFichier(videoStepDetailsFichierPayload: $videoStepDetailsFichierPayload) {
            codenv
            codorg
            codapp
            percod
            codcom
            codfic
            numcom
            libfic
            refimp
            codcli
            dfiexp
            pagfic
            plific
            rejfic
          }
        }
      `,
      variables: {
        videoStepDetailsFichierPayload: videoStepDetailsFichierPayload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public valideOuInvalideGenEtp(payload: ValideOrInvalideGenEtpPayload[]) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation valideOuInvalideGenEtp($payload: [ValideOrInvalideGenEtpPayload]) {
            valideOuInvalideGenEtp(payload: $payload) {
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
