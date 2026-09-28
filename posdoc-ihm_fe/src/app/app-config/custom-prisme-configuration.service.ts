import { Injectable } from '@angular/core';
import { PrismeAngularConfiguration } from '@acoss/prisme-angular-intranet';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class CustomPrismeConfigurationService extends PrismeAngularConfiguration {
  public static CUSTOM_CONF_KEY = 'custom_temp_prisme_conf';

  private static conf: PrismeAngularConfiguration;

  constructor(config: AppConfigService) {
    CustomPrismeConfigurationService.conf = config.settings.prismeConfiguration;

    let usedConf = CustomPrismeConfigurationService.conf;
    // Surcharge de la conf pour permettre le traitement du retour spécifique
    if (sessionStorage.getItem(CustomPrismeConfigurationService.CUSTOM_CONF_KEY)) {
      usedConf = JSON.parse(sessionStorage.getItem(CustomPrismeConfigurationService.CUSTOM_CONF_KEY));
    }
    super(new PrismeAngularConfiguration(usedConf));
  }

  public setCustomConfiguration(customConf: any): void {
    sessionStorage.setItem(CustomPrismeConfigurationService.CUSTOM_CONF_KEY, JSON.stringify(customConf));
  }

  public removeCustomConfiguration(prismeConf: PrismeAngularConfiguration): void {
    // Redefinition de toutes les valeurs à défaut pour permettre une connexion en mode nominal
    prismeConf.prismeAuthzEndpoint = CustomPrismeConfigurationService.conf.prismeAuthzEndpoint;
    prismeConf.prismeTokenEndpoint = CustomPrismeConfigurationService.conf.prismeTokenEndpoint;
    prismeConf.prismeUserEndpoint = CustomPrismeConfigurationService.conf.prismeUserEndpoint;
    prismeConf.prismeKeysEndpoint = CustomPrismeConfigurationService.conf.prismeKeysEndpoint;
    prismeConf.prismeScopeFront = CustomPrismeConfigurationService.conf.prismeScopeFront;
    prismeConf.prismeScopeBack = CustomPrismeConfigurationService.conf.prismeScopeBack;
    prismeConf.prismeClientId = CustomPrismeConfigurationService.conf.prismeClientId;
    prismeConf.prismeClientSecret = CustomPrismeConfigurationService.conf.prismeClientSecret;
    prismeConf.prismeCodeApp = CustomPrismeConfigurationService.conf.prismeCodeApp;

    sessionStorage.removeItem(CustomPrismeConfigurationService.CUSTOM_CONF_KEY);
  }
}
