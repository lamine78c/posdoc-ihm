import { LoginService } from '@acoss/prisme-angular-intranet';
import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {EnvironmentService} from "@app/shared/services/EnvironmentService";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  language = '';
  environmentName: string = '';

  @Output()
  toggle = new EventEmitter<boolean>();

  toggleSideBar() {
    this.toggle.emit();
  }

  private readonly environmentService = inject(EnvironmentService);
  private readonly loginService = inject(LoginService);

  constructor() {
    //no-op
  }

  ngOnInit() {
    this.environmentName = this.environmentService.getCurrentEnvironment();
  }

  isConnected() {
    return this.loginService.hasAccessTokenBackInStorage();
  }
}
