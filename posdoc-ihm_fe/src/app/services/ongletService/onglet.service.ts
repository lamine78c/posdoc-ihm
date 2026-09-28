import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { ZERO } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class OngletService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  getIndexOnglet(onglets: OngletPremierNiveau[], fragment: string) {
    return onglets.findIndex(e => e.label.toLowerCase() === fragment.toLowerCase());
  }

  navigateToFirstOnglet(onglets: OngletPremierNiveau[]) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      fragment: onglets[ZERO]?.label.toLowerCase(),
      queryParamsHandling: 'preserve',
    });
  }
}
