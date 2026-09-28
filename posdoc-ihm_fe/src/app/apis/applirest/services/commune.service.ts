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
 * Operations concernant les communes
 */
@Injectable({
  providedIn: 'root',
})
class CommuneService extends __BaseService {
  static readonly RechercherCommunesPath = '/communes';

  constructor(config: __Configuration, http: HttpClient) {
    super(config, http);
  }

  /**
   * Rechercher parmi les communes
   * @param sort Criteres de tri
   * @param size Nombre d'�l�ments demand�s
   * @param currentPage page courante
   * @return Recherche effectuee
   */
  RechercherCommunesResponse(sort?: Array<string>, size?: number, currentPage?: number): __Observable<__StrictHttpResponse<Array<CommuneType>>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    (sort || []).forEach(val => {
      if (val != null) __params = __params.append('sort', val.toString());
    });
    if (size != null) __params = __params.set('size', size.toString());
    if (currentPage != null) __params = __params.set('currentPage', currentPage.toString());
    let req = new HttpRequest<any>('GET', this.rootUrl + `/communes`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<Array<CommuneType>>;
      })
    );
  }
  /**
   * Rechercher parmi les communes
   * @param sort Criteres de tri
   * @param size Nombre d'�l�ments demand�s
   * @param currentPage page courante
   * @return Recherche effectuee
   */
  RechercherCommunes(sort?: Array<string>, size?: number, currentPage?: number): __Observable<Array<CommuneType>> {
    return this.RechercherCommunesResponse(sort, size, currentPage).pipe(__map(_r => _r.body as Array<CommuneType>));
  }
}

module CommuneService {}

export { CommuneService };
