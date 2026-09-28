import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfiguration } from '../models/configuration/application-configuration';
import { PrismeAngularConfiguration } from '@acoss/prisme-angular-intranet';

@Injectable({
  providedIn: 'root',
})
export class ApplicationConfigurationService {
  private appConfiguration: ApplicationConfiguration;

  constructor(private http: HttpClient) {}

  loadConfiguration(): Promise<any> {
    return new Promise<any>((r, e) => {
      this.http.get('./assets/configuration/configuration.json').subscribe(
        data => {
          this.appConfiguration = data as ApplicationConfiguration;
          r(this);
        },
        error => {
          console.error('Impossible de charger la configuration de POSDOC', error);
          e(error);
        }
      );
    });
  }

  prismeConfiguration(): PrismeAngularConfiguration {
    return this.appConfiguration.prismeConfiguration;
  }
}
