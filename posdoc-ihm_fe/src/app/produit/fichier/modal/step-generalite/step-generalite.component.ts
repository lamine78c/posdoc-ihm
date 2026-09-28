import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Component({
  selector: 'app-step-generalite',
  templateUrl: './step-generalite.component.html',
  styleUrls: ['./step-generalite.component.scss'],
  standalone: false,
})
export class StepGeneraliteComponent {
  @Input() form: FormGroup;
  @Input() dataDefinition;
  @Input() clientOption;
  @Input() formatOption;
  @Input() typSupportOption;
  @Input() imprimeData = [];
  @Input() noRegionFound;
  @Input() noRegionFoundb;
  @Output() editOrganismeClientClick = new EventEmitter<any>();

  signatureOptions = [
    { value: 'R', text: 'RECTO' },
    { value: 'V', text: 'VERSO' },
  ];

  constructor() {
    // nothing
  }

  onEditOrganismeClient() {
    this.editOrganismeClientClick.emit();
  }

  getEnvironnement() {
    const env = this.dataDefinition.environnement;
    let envString = '';
    Object.keys(env).forEach(e => {
      if (env[e]) envString = envString + e + ', ';
    });
    const start = 0;
    const end = -2;
    return envString.slice(start, end);
  }

  getOrganisme() {
    const org = this.dataDefinition.organisme;
    const orgArray = [];
    SharedUtil.extractSelectedOrgs(org, orgArray);
    const len = 4;
    return orgArray.length > len ? orgArray.length + ' organismes sélectionnés' : orgArray.join(', ');
  }
}
