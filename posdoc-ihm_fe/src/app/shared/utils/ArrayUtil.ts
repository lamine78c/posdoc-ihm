import { getCodeClientByCodeOrganismeInterface, isCodeClientGeneralInterface, transformCodeClientInterface } from '@app/models/transformeCodeClient';
import { AllOrganiClientInterface } from '@app/produit/fichier/model/get-config-data-for-add-interface';
import { isEqual } from 'lodash';
import { from, Observable } from 'rxjs';
import { distinct, pluck, toArray } from 'rxjs/operators';
import { COD_APP_SNV2, CODE_CLIENT_UR_GENERAL, PREFIXE_COD_CLI_SNV2, ONE } from './Constants';

export class ArrayUtil {
  static isEqual(a: any, b: any): boolean {
    return isEqual(a, b);
  }

  static getUniqueList(elements: any[], property: string): any[] {
    return [...new Map(elements.map(item => [item[property], item])).values()] as any;
  }

  static getUniqueListAsObservable(elements: any[], property: string): Observable<any> {
    return from(elements).pipe(
      // Extract the 'name' property from each object
      pluck(property),
      // Use distinct to filter out duplicate names
      distinct(),
      // Convert the observable stream to an array
      toArray()
    );
  }

  static convertArrayDimention(inputArray: string[], newDimention: number): any[] {
    const chunkSize: number = inputArray.length / newDimention;
    return inputArray
      .reduce((acc: string[], curr: string, index: number) => {
        const chunkIndex = Math.floor(index / chunkSize);
        if (!acc[chunkIndex]) {
          acc[chunkIndex] = curr;
        } else {
          acc[chunkIndex] += '\n' + curr;
        }
        return acc;
      }, [])
      .map(e => ({ text: e, border: false }));
  }

  static extractTrueKeys(arr) {
    return arr.reduce((acc, obj) => {
      Object.keys(obj).forEach(key => obj[key] && acc.push(key));
      return acc;
    }, []);
  }

  static extractSelectedOrgs(rawOrg: any, selectedOrgs: string[]): void {
    Object.keys(rawOrg).forEach(r => {
      Object.keys(rawOrg[r])
        .filter(o => rawOrg[r][o])
        .forEach(i => selectedOrgs.push(i));
    });
  }

  static isSelectedOrgsInOneRegion(rawOrg: any): boolean {
    const selectedRegs = [];
    Object.keys(rawOrg).forEach(r => {
      Object.keys(rawOrg[r])
        .filter(o => rawOrg[r][o])
        .forEach(i => !selectedRegs.includes(r) && selectedRegs.push(r));
    });
    return selectedRegs.length === ONE;
  }

  static transformCodeClient(param: transformCodeClientInterface) {
    if (param.codeClient === CODE_CLIENT_UR_GENERAL) {
      if (Object.keys(param.orgCliSansRegValue).includes(param.codeOrganisme)) {
        // code client spécifié dans le formulaire pour les organismes sans régions
        return param.orgCliSansRegValue[param.codeOrganisme];
      } else {
        return this.getCodeClientByCodeOrganisme({
          codeOrganisme: param.codeOrganisme,
          allOrgCliSnv2: param.allOrgCliSnv2,
          allClientList: param.allClientList,
          allOrgReg: param.allOrgReg,
        });
      }
    } else {
      return param.codeClient;
    }
  }

  static getCodeClientByCodeOrganisme(param: getCodeClientByCodeOrganismeInterface) {
    // Si l'organisme est dans allOrgCliSnv2
    let codcli = param.allOrgCliSnv2.find((e: AllOrganiClientInterface) => e.codorg == param.codeOrganisme)?.codcli;
    if (!codcli) {
      // le client URXYZ, XYZ est le code région.
      codcli = param.allClientList.find(e => e == PREFIXE_COD_CLI_SNV2 + param.allOrgReg.find(o => o.code == param.codeOrganisme).codeRegion);
    }
    return codcli;
  }

  static isCodeClientGeneral(param: isCodeClientGeneralInterface) {
    // return false pour les application non SNV2
    if (param.codeApplication !== COD_APP_SNV2) {
      return false;
    }
    // return true pour les organismes sans region
    // on ne vérifie pas dans ce cas là
    if (!param.codeRegion) {
      return true;
    }
    // return true pour les lignes dans organi_client_snv2
    if (param.allOrgCliSnv2?.find((e: AllOrganiClientInterface) => e.codorg === param.codeOrganisme && e.codcli === param.codeClient)) {
      return true;
    }
    // return true pour le client URXYZ, XYZ est le code région.
    if (param.codeClient === PREFIXE_COD_CLI_SNV2 + param.codeRegion) {
      return true;
    }
    return false;
  }
}
