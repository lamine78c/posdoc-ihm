/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BaseService as __BaseService } from '../base-service';
import { AppliRestApiConfiguration as __Configuration } from '../appli-rest-api-configuration';
import { StrictHttpResponse as __StrictHttpResponse } from '../strict-http-response';
import { Observable as __Observable } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';

import { CommuneType } from '../models/commune-type';

/**
 * Operations permettant de tester les differents types d'exceptions remontees par l'application blanche
 */
@Injectable({
  providedIn: 'root',
})
class ErreursService extends __BaseService {
  static readonly GenErreurFonctionnellePath = '/erreurs/fonctionnelle';
  static readonly GenErreurConcurrencePath = '/erreurs/concurrence';
  static readonly GenErreurValidationDtoPath = '/erreurs/validation_dto';
  static readonly GenErreurValidationEntitePath = '/erreurs/validation_entite';
  static readonly GenErreurValidationBasePath = '/erreurs/validation_base';
  static readonly GenErreurTechniquePath = '/erreurs/technique';
  static readonly GenErreurExceptionPath = '/erreurs/exception';

  constructor(config: __Configuration, http: HttpClient) {
    super(config, http);
  }

  /**
   * Generer une erreur fonctionnelle
   */
  GenErreurFonctionnelleResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/erreurs/fonctionnelle`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une erreur fonctionnelle
   */
  GenErreurFonctionnelle(): __Observable<null> {
    return this.GenErreurFonctionnelleResponse().pipe(__map(_r => _r.body as null));
  }

  /**
   * Generer une erreur de concurrence d'acces
   */
  GenErreurConcurrenceResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/erreurs/concurrence`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une erreur de concurrence d'acces
   */
  GenErreurConcurrence(): __Observable<null> {
    return this.GenErreurConcurrenceResponse().pipe(__map(_r => _r.body as null));
  }

  /**
   * Generer une erreur de validation de DTO (saisir un code postal de 6 caracteres)
   * @param commune Donnees de la commune
   */
  GenErreurValidationDtoResponse(commune: CommuneType): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = commune;
    let req = new HttpRequest<any>('POST', this.rootUrl + `/erreurs/validation_dto`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une erreur de validation de DTO (saisir un code postal de 6 caracteres)
   * @param commune Donnees de la commune
   */
  GenErreurValidationDto(commune: CommuneType): __Observable<null> {
    return this.GenErreurValidationDtoResponse(commune).pipe(__map(_r => _r.body as null));
  }

  /**
   * Generer une erreur de validation d'entite par Hibernate Validator
   */
  GenErreurValidationEntiteResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/erreurs/validation_entite`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une erreur de validation d'entite par Hibernate Validator
   */
  GenErreurValidationEntite(): __Observable<null> {
    return this.GenErreurValidationEntiteResponse().pipe(__map(_r => _r.body as null));
  }

  /**
   * Generer une erreur de validation d'entite en base
   */
  GenErreurValidationBaseResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/erreurs/validation_base`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une erreur de validation d'entite en base
   */
  GenErreurValidationBase(): __Observable<null> {
    return this.GenErreurValidationBaseResponse().pipe(__map(_r => _r.body as null));
  }

  /**
   * Generer une erreur technique
   */
  GenErreurTechniqueResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/erreurs/technique`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une erreur technique
   */
  GenErreurTechnique(): __Observable<null> {
    return this.GenErreurTechniqueResponse().pipe(__map(_r => _r.body as null));
  }

  /**
   * Generer une exception non prevue
   */
  GenErreurExceptionResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/erreurs/exception`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Generer une exception non prevue
   */
  GenErreurException(): __Observable<null> {
    return this.GenErreurExceptionResponse().pipe(__map(_r => _r.body as null));
  }
}

module ErreursService {}

export { ErreursService };
