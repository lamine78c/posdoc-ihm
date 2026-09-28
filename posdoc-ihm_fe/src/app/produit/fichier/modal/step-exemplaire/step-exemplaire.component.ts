import { Component, Input, OnInit } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Component({
  selector: 'app-step-exemplaire',
  templateUrl: './step-exemplaire.component.html',
  styleUrls: ['./step-exemplaire.component.scss'],
  standalone: false,
})
export class StepExemplaireComponent implements OnInit {
  @Input() dataDefinition;
  @Input() ressource;

  ressourcesByEnv;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    let groupedByEnv = this.ressource.reduce((result: any, currentValue: any) => {
      (result[currentValue['codeEnvironnement']] = result[currentValue['codeEnvironnement']] || []).push(currentValue);
      return result;
    }, {});

    // grouped by env and distinct by gamme
    let res = [];
    for (let key in groupedByEnv) {
      let r = groupedByEnv[key].filter(function (rec) {
        const key = rec.codeGamme + '|' + rec.codeSite + '|' + rec.codeRessource;
        if (!this[key]) {
          this[key] = true;
          return true;
        }
      }, Object.create(null));

      r.sort(
        (a, b) => a.codeGamme.localeCompare(b.codeGamme) || a.codeRessource.localeCompare(b.codeRessource) || a.codeSite.localeCompare(b.codeSite)
      );
      res.push({ env: key, exem: r });
    }

    this.ressourcesByEnv = res;
  }

  boxClick(event, data) {
    this.ressource.forEach(e => {
      if (
        e.codeEnvironnement == data.codeEnvironnement &&
        e.codeGamme == data.codeGamme &&
        e.codeSite == data.codeSite &&
        e.codeRessource == data.codeRessource
      ) {
        e.value = event;
      }
    });
  }

  getEnvironnement() {
    let env = this.dataDefinition.environnement;
    let envString = '';
    Object.keys(env).forEach(e => {
      if (env[e]) envString = envString + e + ', ';
    });
    return envString.slice(0, -2);
  }

  getOrganisme() {
    let org = this.dataDefinition.organisme;
    let orgArray = [];
    SharedUtil.extractSelectedOrgs(org, orgArray);
    return orgArray.length > 4 ? orgArray.length + ' organismes sélectionnés' : orgArray.join(', ');
  }
}
