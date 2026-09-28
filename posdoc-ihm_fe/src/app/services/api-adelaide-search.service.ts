import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';
import { ApolloQueryResult } from 'apollo-client';
import { ApiAdelaideEnvironnementService } from './api-adelaide-environnement.service';
import { ApiAdelaideOrganismeService } from './api-adelaide-organisme.service';
import { ApiAdelaideRegionService } from './api-adelaide-region.service';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideSearchService {
  constructor(
    private fb: UntypedFormBuilder,
    private apiAdelaideEnvironnement: ApiAdelaideEnvironnementService,
    private apiAdelaideOrganismeService: ApiAdelaideOrganismeService,
    private apiAdelaideRegionService: ApiAdelaideRegionService
  ) {}

  environnements: any = [];

  regions: any = [];
  organismes: any = [];
  organismesRegions: any = [];

  formGroupOrgReg: UntypedFormGroup;

  getAllEnvironnements(): any[] {
    this.environnements = [];
    this.apiAdelaideEnvironnement.getAllEnvironnement().subscribe(data => {
      (data as any).data.allEnvironnements.forEach(element => {
        this.environnements.push({ value: element.code, text: element.libelle });
      });
    });
    return this.environnements;
  }

  getAllOrganismesRegions(): UntypedFormGroup {
    this.regions = [];
    this.organismes = [];
    this.organismesRegions = [];
    this.formGroupOrgReg = new UntypedFormGroup({});

    this.apiAdelaideRegionService.getAllRegions().subscribe((result: ApolloQueryResult<AllRegionsInterface>) => {
      this.regions = result.data.allRegions;

      this.apiAdelaideOrganismeService.getAllOrganismes().subscribe(data => {
        this.organismes = (data as any).data.allOrganismes;
        const organismesNoRegion = this.organismes.filter(org => org.codeRegion == null || org.codeRegion == '');

        this.regions.forEach(item => {
          let jsonObject: any = {};
          let organismes: any = [];

          this.organismes.forEach(org => {
            if (org.codeRegion == item.code) {
              organismes.push(org);
            }
          });

          if (organismes.length != 0) {
            organismes.forEach(item1 => (jsonObject[item1.code + '-' + item1.libelle] = false));
            this.formGroupOrgReg.controls[item.code + ' ' + '-' + ' ' + item.libelle] = this.fb.group(jsonObject);
            this.formGroupOrgReg.value[item.code + ' ' + '-' + ' ' + item.libelle] = jsonObject;
          } else jsonObject = {};
        });

        organismesNoRegion.forEach(item => {
          let jsonObject: any = {};
          let organismes: any = [];
          organismesNoRegion.forEach(org => {
            if (org.code == item.code) {
              organismes.push(org);
            }
          });

          organismes.forEach(item1 => (jsonObject[item1.code + '-' + item1.libelle] = [false, null]));
          this.formGroupOrgReg.controls[item.code + ' ' + '-' + ' ' + item.libelle] = this.fb.group(jsonObject);
          this.formGroupOrgReg.value[item.code + ' ' + '-' + ' ' + item.libelle] = [false, null];
        });
      });
    });

    return this.formGroupOrgReg;
  }
}
