import {LoginService, OauthService, PrismeAngularConfiguration} from '@acoss/prisme-angular-intranet';
import {Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PopupHelpComponent} from '@app/admin/contenu/popup-help/popup-help.component';
import {CustomPrismeConfigurationService} from '@app/app-config/custom-prisme-configuration.service';
import {DialogUserPermissionComponent} from '@app/layout/dialog-user-permission/dialog-user-permission.component';
import {AuthentificationVerificationService} from '@app/layout/service/authentification-verification.service';
import {Organisme} from '@app/models/organisme';
import {ProfileData} from '@app/models/profile';
import {ApiAdelaideOrganismeService} from '@app/services/api-adelaide-organisme.service';
import {ApiAdelaideProfileService} from '@app/services/api-adelaide-profile.service';
import {AutoUnsubscribe} from '@app/shared/decorators/auto-unsubscribe.decorator';
import {LogoutService} from '@app/shared/services/logout.service';
import {TokenExpirationService} from '@app/shared/services/TokenExpirationService';
import {FIVE, NOTIFICATION_REFRESH_INTERVAL, ZERO} from '@app/shared/utils/Constants';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApolloQueryResult} from 'apollo-client';
import {combineLatest, interval, of, Subscription} from 'rxjs';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {DialogErrorServerComponent} from '../dialog-error-server/dialog-error-server.component';
import {ApiAdelaideFaqService} from '@app/services/api-adelaide-faq.service';
import {FaqNotification, GetNotificationInterface} from '@app/models/notification';
import {NotificationsRefreshService} from '@app/shared/services/notifications-refresh.service';
import {NotificationsListComponent} from './notifications-list/notifications-list.component';

@AutoUnsubscribe
@Component({
  selector: 'app-authentification',
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.scss'],
  standalone: false,
})
export class AuthentificationComponent implements OnInit, OnDestroy {
  popupIsDisplayed = false;
  notifsCount = 0;
  notifications: FaqNotification[] = [];

  @ViewChild(NotificationsListComponent) notificationsListComponent: NotificationsListComponent;

  private readonly modalService = inject(NgbModal);
  private readonly oauthService = inject(OauthService);
  private readonly customPrisme = inject(CustomPrismeConfigurationService);
  private readonly prismeAngularConfiguration = inject(PrismeAngularConfiguration);
  private readonly authentificationVerificationService = inject(AuthentificationVerificationService);
  private readonly apiAdelaideProfileService = inject(ApiAdelaideProfileService);
  private readonly apiAdelaideFaqService = inject(ApiAdelaideFaqService);
  private readonly api = inject(ApiAdelaideOrganismeService);
  private readonly loginService = inject(LoginService);
  private readonly notificationsRefreshService = inject(NotificationsRefreshService);
  private readonly router = inject(Router);
  private readonly tokenExpirationService = inject(TokenExpirationService);
  private readonly logoutService = inject(LogoutService);

  subscriptions: Subscription[] = [];

  ngOnInit() {
    if (this.isConnecte()) {
      this.tokenExpirationService.startTokenExpirationCheck();
    }

    this.initNotifications();
  }

  isConnecte() {
    if (this.loginService.hasAccessTokenBackInStorage() && !this.popupIsDisplayed) {
      this.verifyUserProfileAndPermission();
      this.popupIsDisplayed = true;
    }
    return this.loginService.hasAccessTokenBackInStorage();
  }

  getUtilisateur() {
    return this.loginService.getIdentifiantUtilisateur();
  }

  initNotifications() {
    // Charger les notifications après que les données d'authentification soient prêtes (user.login et profile en sessionStorage)
    this.subscriptions.push(
      this.authentificationVerificationService.authDataReady$.subscribe(() => {
        this.loadNotifications();
      })
    );

    // Charger les notifications au démarrage si déjà connecté (refresh de page)
    if (sessionStorage.getItem('user.login') && sessionStorage.getItem('profile')) {
      this.loadNotifications();
    }

    // Rafraîchir automatiquement toutes les 15 minutes
    this.subscriptions.push(
      interval(NOTIFICATION_REFRESH_INTERVAL).subscribe(() => {
        this.loadNotifications();
      })
    );

    // Permettre un rafraîchissement manuel via le service
    this.subscriptions.push(
      this.notificationsRefreshService.refresh$.subscribe(() => this.loadNotifications())
    );
  }

  loadNotifications() {
    this.apiAdelaideFaqService.getNotificationsCount().subscribe({
      next: (result: ApolloQueryResult<GetNotificationInterface>) => {
        this.notifications = result.data.getNotification;
        this.notifsCount = this.notifications.length;
      },
      error: () => {
        // En cas d'erreur, ne rien faire pour éviter de perturber l'utilisateur
      }
    });
  }

  openNotificationsModal() {
    if (this.notificationsListComponent && this.notifsCount > 0) {
      this.notificationsListComponent.openModal();
    }
  }

  /**
   * Redirection vers la mire d'authentification déléguée
   */
  login() {
    // On supprime l'enventuel conf spécifique si l'on utilise le bouton standard
    this.customPrisme.removeCustomConfiguration(this.prismeAngularConfiguration);
    window.location.href = this.oauthService.authentificationFrontUrl(this.router.url);
  }

  logout() {
    this.logoutService.logout('/');
  }

  verifyUserProfileAndPermission() {
    this.subscriptions.push(
      this.authentificationVerificationService.data$
        .pipe(
          switchMap(() => {
            const profileId = this.loginService.getInfos().infosUtilisateurFront.hrProfil;
            const regions = this.loginService.getInfos().infosUtilisateurFront.access.map(e => e.split(':')[ZERO].substring(ZERO, FIVE));

            return combineLatest([this.apiAdelaideProfileService.getProfileById(profileId), this.api.getCodesOrganismesByRegions(regions)]);
          }),
          map(([profileResponse, organismesResponse]) => {
            const profile = (profileResponse as ProfileData).data.profile.profile;
            const organismes = (organismesResponse as ApolloQueryResult<Organisme>).data.getCodesOrganismesByRegions;
            return { profile, organismes };
          }),
          filter(({ profile, organismes }) => (!profile || profile === 'GESTION') && !organismes),
          catchError(() => {
            this.openPopupErrorServer();
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            this.openPopupErrorPermission();
          }
        })
    );
  }

  openPopupErrorPermission(): void {
    const modalRef = this.modalService.open(DialogUserPermissionComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.login = this.loginService.getIdentifiantUtilisateur();
  }

  openPopupErrorServer(): void {
    const modalRef = this.modalService.open(DialogErrorServerComponent);
    modalRef.componentInstance.modalRef = modalRef;
  }

  loadHelp() {
    const modalRef = this.modalService.open(PopupHelpComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.path = decodeURIComponent(this.router.url);
  }

  ngOnDestroy() {
    this.tokenExpirationService.stopTokenExpirationCheck();
  }
}
