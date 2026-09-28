import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';

export class StringUtil {
  static getOrganismePropertyName(element: any): string {
    if (element.hasOwnProperty('codeOrganisation')) {
      return element.codeOrganisation;
    } else if (element.hasOwnProperty('codeOrganisme')) {
      return element.codeOrganisme;
    } else if (element.hasOwnProperty('codeOrg')) {
      return element.codeOrg;
    } else if (element.hasOwnProperty('organismeMassification')) {
      return element.organismeMassification;
    } else {
      return element.codorg;
    }
  }

  static getCodeRegionByCodeOrg(organismes, codeOrg) {
    return organismes.find(o => o.code == codeOrg)?.codeRegion ?? '';
  }

  /**
   * Récupérer l'intersection des destinataires parmi des organismes
   * @param allDesOrg
   * @param listOrgs
   */
  static getDestinataireEnIntersection(allDesOrg: [{ code: string; codeOrg: string }], listOrgs: string[]): string[] {
    let res = [];
    let listDess = [];
    for (let key in listOrgs) {
      let listDesInOrg = allDesOrg.filter(rel => rel.codeOrg == listOrgs[key]).map(rel => rel.code);
      if (listDesInOrg.length == 0) {
        return [];
      } else {
        listDess.push(listDesInOrg);
      }
    }

    listDess[0].forEach(des => {
      let isFind = true;
      for (let key in listDess) {
        if (!listDess[key].includes(des)) {
          isFind = false;
          break;
        }
      }
      isFind && res.push(des);
    });
    return res;
  }

  /**
   * Ajoute les erreurs dans la map
   */
  static setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  /**
   * Fonction de comparaison personnalisée pour trier des strings avec des '/'.
   * Le tri doit se faire sur la première partie (avant le premier '/'),
   * puis sur la troisième partie (avant le deuxième '/'),
   * et en fin sur la seconde partie (entre le premier et le deuxième '/').
   *
   * Exemple de liste non triée :
   * [DM/CIRSO/GED-SAE
   * DM/CIRTIL/GED-ADEC
   * DM/CIRTIL/GED-NAT
   * DM/CIRTIL/GED-SAE
   * FT/CIRSO/COALA]
   *
   * Liste triée :
   * [DM/CIRTIL/GED-ADEC
   * DM/CIRTIL/GED-NAT
   * DM/CIRSO/GED-SAE
   * DM/CIRTIL/GED-SAE
   * FT/CIRSO/COALA]
   *
   */
  static compareKeys(keyA: string, keyB: string): number {
    const partsA = keyA.split('/');
    const partsB = keyB.split('/');

    // Comparaison de la première partie (racine)
    const mainCompare = (partsA[0] || '').localeCompare(partsB[0] || '');
    if (mainCompare !== 0) {
      return mainCompare;
    }

    // Comparaison des parties restantes après la deuxième
    const restA = partsA.slice(2).join('/');
    const restB = partsB.slice(2).join('/');
    const restCompare = restA.localeCompare(restB);
    if (restCompare !== 0) {
      return restCompare;
    }

    // Comparaison de la seconde partie
    return (partsA[1] || '').localeCompare(partsB[1] || '');
  }

  static uniqueKey() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static addPercent(str: string) {
    str = str.trim();
    return str ? '%' + str + '%' : null;
  }

  // Le tri pour les dates format DD/MM/YYYY
  static compareKeysDateFR(a: string, b: string): number {
    const [da, ma, ya] = a.split('/');
    const [db, mb, yb] = b.split('/');
    return Number(`${ya}${ma}${da}`) - Number(`${yb}${mb}${db}`);
  }
}
