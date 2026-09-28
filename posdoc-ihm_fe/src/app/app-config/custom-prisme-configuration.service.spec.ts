import { TestBed } from '@angular/core/testing';

import { CustomPrismeConfigurationService } from './custom-prisme-configuration.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { PrismeAngularConfiguration } from '@acoss/prisme-angular-intranet';
import { IAppConfig } from './app-config.model';

const config: any = require('src/assets/configuration/configuration.json');

export class AppConfigMock implements IAppConfig {
  environnement: {
    name: 'dev';
  };
  application: {
    name: 'test';
    version: '1.0.0';
  };
  logging: {
    console: true;
    level: 'DEBUG';
  };
  apiServer: {
    baseUrl: 'monAPI';
  };
  prismeConfiguration: PrismeAngularConfiguration;
  documentations: {
    projets: [];
  };
  liens: {
    blocs: [
      {
        titre: 'Titre';
        liens: [
          {
            icone: 'Icone';
            lien: 'Lien';
            nomlien: 'nom du lien';
            description: 'petite description';
          },
        ];
      },
    ];
  };
  constructor(prismeConfiguration: PrismeAngularConfiguration) {
    this.prismeConfiguration = prismeConfiguration;
  }
}

export function loadPrismeConfigurationMethode1() {
  return new PrismeAngularConfiguration(config.prismeConfiguration);
}

export function loadAppConfig() {
  const appConfigService = new AppConfigService(null);
  const configMock = new AppConfigMock(loadPrismeConfigurationMethode1());
  appConfigService.settings = configMock;
  return appConfigService;
}

describe('CustomPrismeConfigurationService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: PrismeAngularConfiguration, useFactory: loadPrismeConfigurationMethode1 },
        { provide: AppConfigService, useFactory: loadAppConfig },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    })
  );

  it('should be created', () => {
    const service: CustomPrismeConfigurationService = TestBed.inject(CustomPrismeConfigurationService);
    expect(service).toBeTruthy();
  });
});
