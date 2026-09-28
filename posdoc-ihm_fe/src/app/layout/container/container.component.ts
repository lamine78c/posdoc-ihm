import { LoginService } from '@acoss/prisme-angular-intranet';
import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiAdelaideOrganismeService } from '@app/services/api-adelaide-organisme.service';
import { LoaderService } from '@app/services/loaderServeice/loader.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AuthentificationVerificationService } from '@app/layout/service/authentification-verification.service';
import { FIVE, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  standalone: false,
})
export class ContainerComponent implements OnInit, AfterViewInit, AfterContentChecked {
  loading;
  showNavigationBar = false;
  hasOnglet = false;

  private readonly loginService = inject(LoginService);
  private readonly api = inject(ApiAdelaideOrganismeService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly permissionService = inject(PermissionService);
  private readonly authentificationVerificationService = inject(AuthentificationVerificationService);
  private readonly loaderService = inject(LoaderService);
  private readonly renderer = inject(Renderer2);
  private readonly cdref = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(
      ({ perms }) => {
        if (perms != null) {
          this.permissionService.setProfile((perms as any).data.profile.profile);
          this.permissionService.setPermissions((perms as any).data.profile.habilitations);
        }
      },
      erreur => {
        console.error(`profile  non trouvé dans posdoc :  ${erreur}`);
      }
    );

    this.loaderService.httpProgress().subscribe((status: boolean) => {
      this.loading = status;
      this.cdref.detectChanges();
      if (status) {
        this.renderer.addClass(document.body, 'cursor-loader');
      } else {
        this.renderer.removeClass(document.body, 'cursor-loader');
      }
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
    this.hasOnglet = !!document.getElementsByTagName('app-onglet').length;
  }

  ngAfterViewInit() {
    const regions = this.loginService.getInfos().infosUtilisateurFront.access.map(e => e.split(':')[ZERO].substring(ZERO, FIVE));
    this.api.getCodesOrganismesByRegions(regions).subscribe(data => {
      sessionStorage.setItem('user.organismes', (data as any).data.getCodesOrganismesByRegions.join(','));
    });
    sessionStorage.setItem('user.login', this.loginService.getIdentifiantUtilisateur());

    // Signaler que les données d'authentification sont prêtes
    this.authentificationVerificationService.sendAuthDataReady();
  }
}
