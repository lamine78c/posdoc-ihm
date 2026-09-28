import { NgModule } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { AppConfigService } from './app-config/app-config.service';

onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`Erreur: Message: ${message}, locations: ${locations}, path: ${path}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// - add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink, matSnackBar: MatSnackBar, appConfig: AppConfigService) {
  return {
    //link: httpLink.create({uri}),
    link: ApolloLink.from([
      new RetryLink({
        attempts: (count, operation, error) => {
          if (!!error && count <= 3) {
            console.error('Pas de réponse du serveur', error);
            matSnackBar.open(`Pas de réponse du serveur, tentative n°${count}`, 'OK');
            return true;
          }
          matSnackBar.open(`Echec de connexion au serveur`, 'OK');
          return false;
        },
        delay: (count, operation, error) => {
          return count * 1000 * Math.random();
        },
      }),
      httpLink.create({ uri: appConfig.apiBaseUrl() }),
    ]),
    cache: new InMemoryCache({
      addTypename: false,
    }),
    devtools: {
      enabled: false,
    },
  };
}

@NgModule({
  exports: [MatSnackBarModule],
  providers: [
    Apollo,
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, MatSnackBar, AppConfigService],
    },
  ],
})
export class GraphQLModule {}
