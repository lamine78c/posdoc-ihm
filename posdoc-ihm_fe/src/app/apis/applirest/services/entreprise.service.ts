/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BaseService as __BaseService } from '../base-service';
import { AppliRestApiConfiguration as __Configuration } from '../appli-rest-api-configuration';
import { StrictHttpResponse as __StrictHttpResponse } from '../strict-http-response';
import { Observable as __Observable } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';

import { EntrepriseType } from '../models/entreprise-type';
import { ResultatCreationType } from '../models/resultat-creation-type';
import { AdresseType } from '../models/adresse-type';

/**
 * Operations concernant les entreprises
 */
@Injectable({
  providedIn: 'root',
})
class EntrepriseService extends __BaseService {
  static readonly RechercherEntreprisesPath = '/entreprises';
  static readonly CreerEntreprisePath = '/entreprises';
  static readonly DenombrerEntreprisesPath = '/entreprises/count';
  static readonly RecupererEntreprisePath = '/entreprises/{idEntreprise}';
  static readonly ModifierEntreprisePath = '/entreprises/{idEntreprise}';
  static readonly SupprimerEntreprisePath = '/entreprises/{idEntreprise}';
  static readonly ModifierPartiellementEntreprisePath = '/entreprises/{idEntreprise}';
  static readonly RechercherAdressesEntreprisePath = '/entreprises/{idEntreprise}/adresses';
  static readonly RajouterAdresseEntreprisePath = '/entreprises/{idEntreprise}/adresses';
  static readonly RecupererAdresseEntreprisePath = '/entreprises/{idEntreprise}/adresses/{idAdresse}';
  static readonly ModifierAdressePath = '/entreprises/{idEntreprise}/adresses/{idAdresse}';
  static readonly SupprimerAdressePath = '/entreprises/{idEntreprise}/adresses/{idAdresse}';
  static readonly ModifierPartiellementAdressePath = '/entreprises/{idEntreprise}/adresses/{idAdresse}';

  constructor(config: __Configuration, http: HttpClient) {
    super(config, http);
  }

  /**
   * Rechercher parmi les entreprises
   * @param params The `EntrepriseService.RechercherEntreprisesParams` containing the following parameters:
   *
   * - `sort`: Criteres de tri
   *
   * - `size`: Nombre d'�l�ments demand�s
   *
   * - `simple`: Indicateur pour ne retourner que les champs simples ou l'objet complet
   *
   * - `denomination`: Denomination de l'entreprise
   *
   * - `currentPage`: page courante
   *
   * - `cp`: Code Postal de l'entreprise
   *
   * @return Recherche effectuee
   */
  RechercherEntreprisesResponse(params: EntrepriseService.RechercherEntreprisesParams): __Observable<__StrictHttpResponse<Array<EntrepriseType>>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    (params.sort || []).forEach(val => {
      if (val != null) __params = __params.append('sort', val.toString());
    });
    if (params.size != null) __params = __params.set('size', params.size.toString());
    if (params.simple != null) __params = __params.set('simple', params.simple.toString());
    if (params.denomination != null) __params = __params.set('denomination', params.denomination.toString());
    if (params.currentPage != null) __params = __params.set('currentPage', params.currentPage.toString());
    if (params.cp != null) __params = __params.set('cp', params.cp.toString());
    let req = new HttpRequest<any>('GET', this.rootUrl + `/entreprises`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<Array<EntrepriseType>>;
      })
    );
  }
  /**
   * Rechercher parmi les entreprises
   * @param params The `EntrepriseService.RechercherEntreprisesParams` containing the following parameters:
   *
   * - `sort`: Criteres de tri
   *
   * - `size`: Nombre d'�l�ments demand�s
   *
   * - `simple`: Indicateur pour ne retourner que les champs simples ou l'objet complet
   *
   * - `denomination`: Denomination de l'entreprise
   *
   * - `currentPage`: page courante
   *
   * - `cp`: Code Postal de l'entreprise
   *
   * @return Recherche effectuee
   */
  RechercherEntreprises(params: EntrepriseService.RechercherEntreprisesParams): __Observable<Array<EntrepriseType>> {
    return this.RechercherEntreprisesResponse(params).pipe(__map(_r => _r.body as Array<EntrepriseType>));
  }

  /**
   * Creer une entreprise
   * @param entreprise Donnees de l'entreprise
   * @return Creation effectuee
   */
  CreerEntrepriseResponse(entreprise: EntrepriseType): __Observable<__StrictHttpResponse<ResultatCreationType>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = entreprise;
    let req = new HttpRequest<any>('POST', this.rootUrl + `/entreprises`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<ResultatCreationType>;
      })
    );
  }
  /**
   * Creer une entreprise
   * @param entreprise Donnees de l'entreprise
   * @return Creation effectuee
   */
  CreerEntreprise(entreprise: EntrepriseType): __Observable<ResultatCreationType> {
    return this.CreerEntrepriseResponse(entreprise).pipe(__map(_r => _r.body as ResultatCreationType));
  }

  /**
   * Compter le nombre d'entreprises
   * @return Denombrement effectue
   */
  DenombrerEntreprisesResponse(): __Observable<__StrictHttpResponse<number>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>('GET', this.rootUrl + `/entreprises/count`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'text',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return (_r as HttpResponse<any>).clone({ body: parseFloat((_r as HttpResponse<any>).body as string) }) as __StrictHttpResponse<number>;
      })
    );
  }
  /**
   * Compter le nombre d'entreprises
   * @return Denombrement effectue
   */
  DenombrerEntreprises(): __Observable<number> {
    return this.DenombrerEntreprisesResponse().pipe(__map(_r => _r.body as number));
  }

  /**
   * Recuperer les donnees d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param simple Indicateur pour ne retourner que les champs simples ou l'objet complet
   * @return Recuperation effectuee
   */
  RecupererEntrepriseResponse(idEntreprise: number, simple?: boolean): __Observable<__StrictHttpResponse<EntrepriseType>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    if (simple != null) __params = __params.set('simple', simple.toString());
    let req = new HttpRequest<any>('GET', this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<EntrepriseType>;
      })
    );
  }
  /**
   * Recuperer les donnees d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param simple Indicateur pour ne retourner que les champs simples ou l'objet complet
   * @return Recuperation effectuee
   */
  RecupererEntreprise(idEntreprise: number, simple?: boolean): __Observable<EntrepriseType> {
    return this.RecupererEntrepriseResponse(idEntreprise, simple).pipe(__map(_r => _r.body as EntrepriseType));
  }

  /**
   * Modifier les donnees d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param entreprise Donnees de l'entreprise, doit contenir la date de derniere mise a jour pour gerer la concurrence d'acces'
   */
  ModifierEntrepriseResponse(idEntreprise: number, entreprise: EntrepriseType): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = entreprise;
    let req = new HttpRequest<any>('PUT', this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}`, __body, {
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
   * Modifier les donnees d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param entreprise Donnees de l'entreprise, doit contenir la date de derniere mise a jour pour gerer la concurrence d'acces'
   */
  ModifierEntreprise(idEntreprise: number, entreprise: EntrepriseType): __Observable<null> {
    return this.ModifierEntrepriseResponse(idEntreprise, entreprise).pipe(__map(_r => _r.body as null));
  }

  /**
   * Supprimer une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   */
  SupprimerEntrepriseResponse(idEntreprise: number): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    let req = new HttpRequest<any>('DELETE', this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}`, __body, {
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
   * Supprimer une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   */
  SupprimerEntreprise(idEntreprise: number): __Observable<null> {
    return this.SupprimerEntrepriseResponse(idEntreprise).pipe(__map(_r => _r.body as null));
  }

  /**
   * Modifier certaines donnees d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param entreprise Donnees de l'entreprise, doit contenir la date de derniere mise a jour pour gerer la concurrence d'acces'
   */
  ModifierPartiellementEntrepriseResponse(idEntreprise: number, entreprise: {}): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = entreprise;
    let req = new HttpRequest<any>('PATCH', this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}`, __body, {
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
   * Modifier certaines donnees d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param entreprise Donnees de l'entreprise, doit contenir la date de derniere mise a jour pour gerer la concurrence d'acces'
   */
  ModifierPartiellementEntreprise(idEntreprise: number, entreprise: {}): __Observable<null> {
    return this.ModifierPartiellementEntrepriseResponse(idEntreprise, entreprise).pipe(__map(_r => _r.body as null));
  }

  /**
   * Recuperer les adresses d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param cp Code Postal de l'adresse
   * @return Recuperation effectuee
   */
  RechercherAdressesEntrepriseResponse(idEntreprise: number, cp?: string): __Observable<__StrictHttpResponse<Array<AdresseType>>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    if (cp != null) __params = __params.set('cp', cp.toString());
    let req = new HttpRequest<any>('GET', this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}/adresses`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'json',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<Array<AdresseType>>;
      })
    );
  }
  /**
   * Recuperer les adresses d'une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param cp Code Postal de l'adresse
   * @return Recuperation effectuee
   */
  RechercherAdressesEntreprise(idEntreprise: number, cp?: string): __Observable<Array<AdresseType>> {
    return this.RechercherAdressesEntrepriseResponse(idEntreprise, cp).pipe(__map(_r => _r.body as Array<AdresseType>));
  }

  /**
   * Ajouter une adresse a une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param adresse Donnees de l'adresse
   * @return Creation effectuee
   */
  RajouterAdresseEntrepriseResponse(idEntreprise: number, adresse: AdresseType): __Observable<__StrictHttpResponse<string>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = adresse;
    let req = new HttpRequest<any>('POST', this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}/adresses`, __body, {
      headers: __headers,
      params: __params,
      responseType: 'text',
    });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<string>;
      })
    );
  }
  /**
   * Ajouter une adresse a une entreprise
   * @param idEntreprise Identifiant de l'entreprise
   * @param adresse Donnees de l'adresse
   * @return Creation effectuee
   */
  RajouterAdresseEntreprise(idEntreprise: number, adresse: AdresseType): __Observable<string> {
    return this.RajouterAdresseEntrepriseResponse(idEntreprise, adresse).pipe(__map(_r => _r.body as string));
  }

  /**
   * Recuperer les donnees d'une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   * @return Recuperation effectuee
   */
  RecupererAdresseEntrepriseResponse(idEntreprise: number, idAdresse: number): __Observable<__StrictHttpResponse<AdresseType>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}/adresses/${encodeURIComponent(String(idAdresse))}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json',
      }
    );

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<AdresseType>;
      })
    );
  }
  /**
   * Recuperer les donnees d'une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   * @return Recuperation effectuee
   */
  RecupererAdresseEntreprise(idEntreprise: number, idAdresse: number): __Observable<AdresseType> {
    return this.RecupererAdresseEntrepriseResponse(idEntreprise, idAdresse).pipe(__map(_r => _r.body as AdresseType));
  }

  /**
   * Modifier les donnees d'une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   * @param adresse Donnees de l'adresse'
   */
  ModifierAdresseResponse(idEntreprise: number, idAdresse: number, adresse: AdresseType): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = adresse;
    let req = new HttpRequest<any>(
      'PUT',
      this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}/adresses/${encodeURIComponent(String(idAdresse))}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json',
      }
    );

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Modifier les donnees d'une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   * @param adresse Donnees de l'adresse'
   */
  ModifierAdresse(idEntreprise: number, idAdresse: number, adresse: AdresseType): __Observable<null> {
    return this.ModifierAdresseResponse(idEntreprise, idAdresse, adresse).pipe(__map(_r => _r.body as null));
  }

  /**
   * Supprimer une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   */
  SupprimerAdresseResponse(idEntreprise: number, idAdresse: number): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    let req = new HttpRequest<any>(
      'DELETE',
      this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}/adresses/${encodeURIComponent(String(idAdresse))}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json',
      }
    );

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Supprimer une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   */
  SupprimerAdresse(idEntreprise: number, idAdresse: number): __Observable<null> {
    return this.SupprimerAdresseResponse(idEntreprise, idAdresse).pipe(__map(_r => _r.body as null));
  }

  /**
   * Modifier certaines donnees d'une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   * @param adresse Donnees de l'adresse'
   */
  ModifierPartiellementAdresseResponse(idEntreprise: number, idAdresse: number, adresse: {}): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = adresse;
    let req = new HttpRequest<any>(
      'PATCH',
      this.rootUrl + `/entreprises/${encodeURIComponent(String(idEntreprise))}/adresses/${encodeURIComponent(String(idAdresse))}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json',
      }
    );

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map(_r => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Modifier certaines donnees d'une adresse
   * @param idEntreprise Identifiant de l'entreprise
   * @param idAdresse Identifiant de l'adresse
   * @param adresse Donnees de l'adresse'
   */
  ModifierPartiellementAdresse(idEntreprise: number, idAdresse: number, adresse: {}): __Observable<null> {
    return this.ModifierPartiellementAdresseResponse(idEntreprise, idAdresse, adresse).pipe(__map(_r => _r.body as null));
  }
}

module EntrepriseService {
  /**
   * Parameters for RechercherEntreprises
   */
  export interface RechercherEntreprisesParams {
    /**
     * Criteres de tri
     */
    sort?: Array<string>;

    /**
     * Nombre d'�l�ments demand�s
     */
    size?: number;

    /**
     * Indicateur pour ne retourner que les champs simples ou l'objet complet
     */
    simple?: boolean;

    /**
     * Denomination de l'entreprise
     */
    denomination?: string;

    /**
     * page courante
     */
    currentPage?: number;

    /**
     * Code Postal de l'entreprise
     */
    cp?: string;
  }
}

export { EntrepriseService };
