import { Injectable } from '@angular/core';
import { ApiAdelaideEnvironnementService } from './api-adelaide-environnement.service';
import { ApiAdelaideOrganismeService } from './api-adelaide-organisme.service';
import { ApiAdelaideRegionService } from './api-adelaide-region.service';
import { ApiAdelaideRessourceService } from './api-adelaide-ressource.service';
import { ApiAdelaideSiteService } from './api-adelaide-site.service';
import { ApiAdelaideColimpService } from '@app/services/api-adelaide-colimp.service';
import { ApiAdelaideComposService } from '@app/services/api-adelaide-compos.service';
import { ApiAdelaideApplicationService } from './api-adelaide-application.service';
import { ApiAdelaideGammeService } from './api-adelaide-gamme.service';
import { ApiAdelaideVerrouService } from './api-adelaide-verrou.service';
import { ApiAdelaideImprimeService } from '@app/services/api-adelaide-imprime.service';
import { ApiAdelaideFormatService } from '@app/services/api-adelaide-format.service';
import { BehaviorSubject, take } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';
import { AllImprimeInterface } from '@app/produit/fond-page/imprime/model/imprime.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideSelectDataService {
  env$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private apiAdelaideRegion: ApiAdelaideRegionService,
    private apiAdelaideSite: ApiAdelaideSiteService,
    private apiAdelaideColimp: ApiAdelaideColimpService,
    private apiAdelaideCompos: ApiAdelaideComposService,
    private apiAdelaideOrganisme: ApiAdelaideOrganismeService,
    private apiAdelaideRessources: ApiAdelaideRessourceService,
    private apiAdelaideEnvironnement: ApiAdelaideEnvironnementService,
    private apiAdelaideApplication: ApiAdelaideApplicationService,
    private apiAdelaideGamme: ApiAdelaideGammeService,
    private apiAdelaideVerrou: ApiAdelaideVerrouService,
    private apiAdelaideImprimeService: ApiAdelaideImprimeService,
    private apiAdelaideFormatService: ApiAdelaideFormatService
  ) {}

  regions: any = [];
  sites: any = [];
  colimps: string[] = [];
  composs: string[] = [];
  organismes: any = [];
  ressources: any = [];
  environnements: any = [];
  applications: any = [];
  gammes: any = [];
  verrous: any = [];
  imprimes: any = [];
  typesFormat: any = [];

  getEnsubject(): BehaviorSubject<any> {
    return this.env$;
  }

  getAllRegions(): any[] {
    this.regions = [];
    this.apiAdelaideRegion.getAllRegions().pipe(take(1)).subscribe((result: ApolloQueryResult<AllRegionsInterface>) => {
      result.data.allRegions.forEach(node => {
        this.regions.push(node.code);
      });
    });
    return this.regions;
  }

  getAllSites(): any[] {
    this.sites = [];
    this.apiAdelaideSite.getAllSitesCNP().pipe(take(1)).subscribe(data => {
      (data as any).data.allSitesCNP.forEach(node => {
        this.sites.push(node.code);
      });
    });
    return this.sites;
  }

  getAllComposs(): string[] {
    this.composs = [];
    this.apiAdelaideCompos.getAllComposs().pipe(take(1)).subscribe((response: any) => {
      response.data.allComposs.forEach(node => {
        !this.composs.includes(node.libmef) && this.composs.push(node.libmef);
      });
    });
    return this.composs;
  }

  getAllColimps(): string[] {
    this.colimps = [];
    this.apiAdelaideColimp.getAllColimps().pipe(take(1)).subscribe((response: any) => {
      response.data.allColimps.forEach(node => {
        !this.colimps.includes(node.libcol) && this.colimps.push(node.libcol);
      });
    });
    return this.colimps;
  }
  getAllOrganismes(): any[] {
    this.organismes = [];
    this.apiAdelaideOrganisme.getAllOrganismes().pipe(take(1)).subscribe(data => {
      (data as any).data.allOrganismes.forEach(node => {
        this.organismes.push(node.code);
      });
    });
    return this.organismes;
  }

  getAllRessources(): any[] {
    // need unique codeRessource
    this.ressources = [];
    this.apiAdelaideRessources.getAllRessources().pipe(take(1)).subscribe(data => {
      (data as any).data.allRessources.forEach(node => {
        !this.ressources.includes(node.codeRessource) && this.ressources.push(node.codeRessource);
      });
    });
    return this.ressources;
  }

  getAllEnvironnements(): any[] {
    this.environnements = [];
    this.apiAdelaideEnvironnement.getAllEnvironnement().pipe(take(1)).subscribe(data => {
      (data as any).data.allEnvironnements.forEach(node => {
        this.environnements.push(node.code);
      });
    });
    return this.environnements;
  }

  getEnvironnements(): any[] {
    return this.environnements;
  }

  getAllApplications(): any[] {
    // need unique code
    this.applications = [];
    this.apiAdelaideApplication.getAllApplications().pipe(take(1)).subscribe(data => {
      (data as any).data.allApplications.forEach(node => {
        !this.applications.includes(node.code) && this.applications.push(node.code);
      });
    });
    return this.applications;
  }

  getApplications(): any[] {
    return this.applications;
  }

  getAllGammes(): any[] {
    this.gammes = [];
    this.apiAdelaideGamme.getAllGammes().pipe(take(1)).subscribe(data => {
      (data as any).data.allGammes.forEach(node => {
        this.gammes.push(node.code);
      });
    });
    return this.gammes;
  }

  getAllVerrous(): any[] {
    this.verrous = [];
    this.apiAdelaideVerrou.getAllVerrous().pipe(take(1)).subscribe(data => {
      (data as any).data.allVerrous.forEach(node => {
        this.verrous.push(node.code);
      });
    });
    return this.verrous;
  }

  getAllImprimes(): any[] {
    this.imprimes = [];
    this.apiAdelaideImprimeService.getAllImprimes().pipe(take(1)).subscribe((data: ApolloQueryResult<AllImprimeInterface>) => {
      data.data.allImprimes.forEach(node => {
        this.imprimes.push(node.reference);
      });
    });
    return this.imprimes;
  }

  getAllTypesFormat(): any[] {
    this.typesFormat = [];
    this.apiAdelaideFormatService.getFormats().pipe(take(1)).subscribe(data => {
      (data as any).data.allFormats.forEach(node => {
        this.typesFormat.push(node.code);
      });
    });
    return this.typesFormat;
  }
}
