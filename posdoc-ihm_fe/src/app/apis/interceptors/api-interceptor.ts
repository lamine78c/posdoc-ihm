import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Classe permettant d''ajouter des éléments dans le header.
 * Actuellement seul le champs "urssaf.id" est ajouter.
 * Il permet d''ajouter un uuid qui permet de faire la trace de bout en bout dans les différentes applications
 */
@Injectable()
export class ApiInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes('/api/v1')) {
      const requestType = request.body?.operationName;
      let regions = sessionStorage.getItem('user.organismes');
      const login = sessionStorage.getItem('user.login');
      const profile = sessionStorage.getItem('profile');

      const headersConfig: { [key: string]: string } = {};

      if (regions) {
        const requestTypes = ['AsyncAPIsForParametreEdition', 'updateMasseExemplaires', 'updateExemplaire'];
        if (requestTypes.includes(requestType)) {
          regions = regions + ',999';
        }
        headersConfig['user.organismes'] = regions;
      }

      if (login) {
        headersConfig['user.login'] = login;
      }

      if (profile) {
        headersConfig['profile'] = profile;
      }

      if (Object.keys(headersConfig).length > 0) {
        request = request.clone({ setHeaders: headersConfig });
      }
    }

    return next.handle(request).pipe(
      tap(
        () => {},
        err => {
          console.error(`Erreur lors de l'envoi de la requête, code = ${err.status}`);
        }
      )
    );
  }
}
