import { PrismeAngularConfiguration } from '@acoss/prisme-angular-intranet';

// Cette interface est un exemple de configuration
export interface IAppConfig {
  environnement: {
    name: string;
  };
  application: {
    name: string;
    version: string;
  };
  logging: {
    console: boolean;
    level: string; // TRACE = 0, DEBUG = 1, INFO = 2, LOG = 3, WARN = 4, ERROR = 5, FATAL = 6, OFF = 7
  };
  apiServer: {
    baseUrl: string;
  };
  prismeConfiguration: PrismeAngularConfiguration;
  // Délai d'inactivité (ms) avant déconnexion automatique — défaut dans Constants si absent
  inactivityLogoutDelay?: number;
}
