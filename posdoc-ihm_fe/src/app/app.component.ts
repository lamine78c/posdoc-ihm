import { LoginService, RefreshService } from '@acoss/prisme-angular-intranet';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TokenExpirationService } from '@app/shared/services/TokenExpirationService';
import { TOKEN_EXPIRATION_CHECK_INTERVAL } from '@app/shared/utils/Constants';
import {AutoUnsubscribe} from "@app/shared/decorators/auto-unsubscribe.decorator";
import { FrontTokenRefreshService } from '@app/shared/services/front-token-refresh.service';
import { InactivityLogoutService } from '@app/shared/services/inactivity-logout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})

@AutoUnsubscribe
export class AppComponent implements OnInit {
  title = 'posdoc-fe-ihm';

  openSideBar = true;
  subscription: Subscription;

  toggleSideBar() {
    this.openSideBar = !this.openSideBar;
  }

  constructor(
    private loginService: LoginService,
    private refreshService: RefreshService,
    private tokenExpirationService: TokenExpirationService,
    private frontTokenRefreshService: FrontTokenRefreshService,
    private inactivityLogoutService: InactivityLogoutService
  ) {}

  ngOnInit(): void {
    if (this.loginService.hasAccessTokenBackInStorage()) {
      this.refreshService.relancerRafraichissement();
    }
    this.tokenExpirationService.startTokenExpirationCheck(TOKEN_EXPIRATION_CHECK_INTERVAL);
    this.inactivityLogoutService.start();
    this.frontTokenRefreshService.start();
  }

  isConnecte() {
    return this.loginService.hasAccessTokenBackInStorage();
  }

  ngOnDestroy(): void {
    this.tokenExpirationService.stopTokenExpirationCheck();
    this.frontTokenRefreshService.stop();
    this.inactivityLogoutService.stop();
  }
}
