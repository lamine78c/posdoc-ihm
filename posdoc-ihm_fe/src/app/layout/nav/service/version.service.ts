import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiAdelaideVersionService } from '@app/services/api-adelaide-version-service';
import { ApolloQueryResult } from '@apollo/client/core';

@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly apiAdelaideVersionService = inject(ApiAdelaideVersionService);

  private version$: Observable<ApolloQueryResult<any>> = this.apiAdelaideVersionService.getVersion().pipe(shareReplay(1));

  private versionAdelaide$: Observable<ApolloQueryResult<any>> = this.apiAdelaideVersionService.getVersionAdelaide().pipe(shareReplay(1));

  constructor() {
    // do nothing
  }

  getVersion(): Observable<ApolloQueryResult<any>> {
    return this.version$;
  }

  getVersionAdelaide(): Observable<ApolloQueryResult<any>> {
    return this.versionAdelaide$;
  }
}
