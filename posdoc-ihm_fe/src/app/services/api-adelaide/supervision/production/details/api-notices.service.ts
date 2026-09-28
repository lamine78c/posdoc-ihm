import { Injectable } from '@angular/core';
import {
  AffectationNoticesInterface,
  FindFichiersForAffectationNoticeInterface,
  NotficCreateInputInterface,
  NotficIdInterface,
  NotficInterface,
} from '@app/models/gestion-fichier-edition/notices/notfic';
import { CreateUpdateNoticeQuery } from '@app/models/payload/create-update-notice';
import { DeleteNoticePdfInterface, DetailsNoticesInterface } from '@app/models/supervision/production/details/notices-interface';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { SearchNoticesByCriteres } from '@app/produit/notice/affectation-notice/model/search-notices-by-criteres';
import {
  NoticesOccurrenceApplicationInterface,
  SearchNoticesOccurrenceApplicationQuery,
} from '@app/suivi/production/modal/fichier-details/models/search-notices-occ-app-interface';
import { NoticesFichiersGraphQL } from '@app/produit/notice/notices-fichiers/model/notices-fichiers-interface';
import { SearchNoticesFichiers } from '@app/produit/notice/notices-fichiers/model/search-notices-fichiers';
import { Apollo, gql } from 'apollo-angular';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiNoticesService {
  constructor(private apollo: Apollo) {}

  findNotficByParam(query: SearchNoticesByCriteres) {
    return this.apollo.watchQuery<AffectationNoticesInterface>({
      query: gql`
        query findNotficByParam($query: SearchNotficQuery!) {
          findNotficByParam(query: $query) {
            codenv
            codorg
            codapp
            codcom
            codfic
            codeProd
            refImprime
            dnotid
            dnotit
            maxnot
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getDetailsNotices(paramData: OngletsParamDataModel) {
    return this.apollo.watchQuery<DetailsNoticesInterface>({
      query: gql`
        query getDetailsNotices($paramData: OngletsParamDataInput!) {
          getDetailsNotices(paramData: $paramData) {
            codcom
            codfic
            numcom
            codprd
            refimp
            libfic
            codnot
            poinot
            fornot
            pornot
            libnot
            codsit
          }
        }
      `,
      variables: {
        paramData: paramData,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getOnlyActiveNotices() {
    return this.apollo.watchQuery({
      query: gql`
        query allActiveNotices {
          allActiveNotices {
            codnot
            libnot
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getActiveNotices() {
    return this.apollo.watchQuery({
      query: gql`
        query allActiveNotices {
          allActiveNotices {
            codnot
            libnot
            fornot
            poinot
            pornot
            dnotir
            perime
            codsit
            isNotAuthorisedToBeDeleted
            pdfFilePath
          }
          allSitesCNP {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  getExpiredNotices() {
    return this.apollo.watchQuery({
      query: gql`
        query allExpiredNotices {
          allExpiredNotices {
            codnot
            libnot
            fornot
            poinot
            pornot
            dnotir
            perime
            codsit
            isNotAuthorisedToBeDeleted
            pdfFilePath
          }
          allSitesCNP {
            code
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  createNotice(createNotice: CreateUpdateNoticeQuery) {
    return this.apollo.mutate({
      mutation: gql`
        mutation createNotice($createNotice: CreateOrUpdateNoticeInput!) {
          createNotice(noticePayload: $createNotice) {
            codnot
            libnot
            fornot
            poinot
            pornot
            dnotir
            perime
            codsit
            isNotAuthorisedToBeDeleted
            pdfFilePath
          }
        }
      `,
      variables: {
        createNotice: createNotice,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateNotice(updateNotice: CreateUpdateNoticeQuery) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateNotice($updateNotice: CreateOrUpdateNoticeInput!) {
          updateNotice(noticePayload: $updateNotice) {
            codnot
            libnot
            fornot
            poinot
            pornot
            dnotir
            perime
            codsit
            isNotAuthorisedToBeDeleted
            pdfFilePath
          }
        }
      `,
      variables: {
        updateNotice: updateNotice,
      },
      fetchPolicy: 'no-cache',
    });
  }

  deleteNotice(codnot: string) {
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation deleteNotice($codnot: String!) {
          deleteNotice(codnot: $codnot) {
            codnot
            libnot
            fornot
            poinot
            pornot
            dnotir
            perime
            codsit
            isNotAuthorisedToBeDeleted
            pdfFilePath
          }
        }
      `,
      variables: {
        codnot: codnot,
      },
      fetchPolicy: 'no-cache',
    });
  }

  uploadNoticePdf(codnot: string, file: File): Observable<any> {
    return this.convertFileToBase64(file).pipe(
      switchMap(base64File =>
        this.apollo.mutate({
          mutation: gql`
            mutation uploadNoticePdf($codnot: String!, $file: Base64FileInput!) {
              uploadNoticePdf(codnot: $codnot, file: $file) {
                codnot
                libnot
                fornot
                poinot
                pornot
                dnotir
                perime
                codsit
                isNotAuthorisedToBeDeleted
                pdfFilePath
              }
            }
          `,
          variables: {
            codnot,
            file: {
              filename: file.name,
              content: base64File,
            },
          },
          fetchPolicy: 'no-cache',
        })
      ),
      catchError(error => throwError(() => new Error(`File upload failed: ${error.message}`)))
    );
  }

  deleteNoticePdf(codnot: string) {
    return this.apollo.mutate<DeleteNoticePdfInterface>({
      mutation: gql`
        mutation deleteNoticePdf($codnot: String!) {
          deleteNoticePdf(codnot: $codnot) {
            codnot
            libnot
            fornot
            poinot
            pornot
            dnotir
            perime
            codsit
            isNotAuthorisedToBeDeleted
            pdfFilePath
          }
        }
      `,
      variables: {
        codnot: codnot,
      },
      fetchPolicy: 'no-cache',
    });
  }

  getNoticePdf(codnot: string) {
    return this.apollo.watchQuery({
      query: gql`
        query GetNoticePdf($codnot: String!) {
          getNoticePdf(codnot: $codnot)
        }
      `,
      variables: {
        codnot: codnot,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public deleteAffectationNotices(notficIds: NotficIdInterface[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($notficIds: [DeleteNotficQuery]!) {
          deleteNotfics(notficIds: $notficIds) {
            ok
          }
        }
      `,
      variables: {
        notficIds: notficIds,
      },
      fetchPolicy: 'no-cache',
    });
  }

  updateNofics(notfics: NotficInterface[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation update($notfics: [UpdateNotficsInput]!) {
          updateNotfics(notfics: $notfics) {
            codenv
            codorg
            codapp
            codcom
            codfic
            codeProd
            refImprime
            dnotid
            dnotit
            maxnot
          }
        }
      `,
      variables: {
        notfics: notfics,
      },
      fetchPolicy: 'no-cache',
    });
  }

  findFichiersForAffectationNotice(query: SearchNoticesByCriteres) {
    return this.apollo.watchQuery<FindFichiersForAffectationNoticeInterface>({
      query: gql`
        query findFichiersForAffectationNotice($query: SearchNotficQuery!) {
          findFichiersForAffectationNotice(query: $query) {
            codenv
            codorg
            codapp
            codcom
            codfic
            codeProd
            refImprime
            dnotid
            dnotit
            maxnot
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  AffectationNotices(query: NotficCreateInputInterface[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation affectationNotfic($query: [NotFicInput]!) {
          affectationNotfic(query: $query) {
            codnot
            codenv
            codorg
            codapp
            codcom
            codfic
            dnotid
            dnotit
            maxnot
            curnot
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    });
  }

  /**
   * Convertit un fichier en Base64 et retourne un Observable<string>
   */
  private convertFileToBase64(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64File = reader.result.split(',')[1];
          observer.next(base64File);
          observer.complete();
        } else {
          observer.error(new Error('Invalid file format'));
        }
      };

      reader.onerror = error => observer.error(error);
    });
  }

  getNoticesOccurrenceApplication(query: SearchNoticesOccurrenceApplicationQuery) {
    return this.apollo.watchQuery<NoticesOccurrenceApplicationInterface>({
      query: gql`
        query getNoticesOccurrenceApplication($query: SearchNoticesOccurrenceApplicationQuery!) {
          getNoticesOccurrenceApplication(query: $query) {
            codnot
            poinot
            fornot
            pornot
            libnot
            codsit
          }
        }
      `,
      variables: {
        query: query,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  findNoticesFichiers(payload: SearchNoticesFichiers) {
    return this.apollo.watchQuery<{ findNoticesFichiers: NoticesFichiersGraphQL[] }>({
      query: gql`
        query findNoticesFichiers($payload: SearchNoticesFichiersPayload!) {
          findNoticesFichiers(payload: $payload) {
            codenv
            codorg
            codapp
            codcom
            codfic
            codeProd
            refImprime
            notices
          }
        }
      `,
      variables: {
        payload: payload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  findNoticeDetailsByFichier(payload: {
    codenv: string;
    codorg: string;
    codapp: string;
    codcom: string;
    codfic: string;
  }) {
    return this.apollo.watchQuery<any>({
      query: gql`
        query findNoticeDetailsByFichier($payload: FindNoticeDetailsByFichierPayload!) {
          findNoticeDetailsByFichier(payload: $payload) {
            codeNotice
            format
            poids
            portee
            dateDebut
            dateFin
          }
        }
      `,
      variables: {
        payload: payload,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
