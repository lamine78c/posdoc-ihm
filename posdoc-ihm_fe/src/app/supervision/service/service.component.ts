import {Component, inject, OnInit} from '@angular/core';
import {ApiAdelaideServicePosdocService} from '@app/services/api-adelaide/admin/service/api-adelaide-service.service';
import {AutoUnsubscribe} from '@app/shared/decorators/auto-unsubscribe.decorator';
import {Subscription, take} from 'rxjs';
import {ServiceWithHealth} from './model/health-check.interface';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ServiceComponent implements OnInit {
  services: ServiceWithHealth[] = [];
  subscriptions: Subscription[] = [];
  expandedStates: boolean[] = [];

  private readonly apiAdelaideService = inject(ApiAdelaideServicePosdocService);

  ngOnInit(): void {
    this.getAllServices();
  }

  getAllServices(): void {
    this.subscriptions.push(
      this.apiAdelaideService.getAllServices().pipe(take(1)).subscribe({
        next: data => {
          this.services = data.data.findAllServices.map(service => ({
            ...service,
            healthCheckLoading: false,
            healthCheckError: null,
            healthCheck: null,
          }));

          this.expandedStates = new Array(this.services.length).fill(false);

          this.services.forEach((service, index) => {
            this.checkServiceHealth(index);
          });
        },
        error: error => {
          console.error('Erreur lors de la récupération des services:', error);
        },
      })
    );
  }

  checkServiceHealth(index: number): void {
    const service = this.services[index];
    service.healthCheckLoading = true;

    this.subscriptions.push(
      this.apiAdelaideService.checkServiceHealth(service.url).subscribe({
        next: (response: any) => {
          try {
            this.services[index].healthCheck = JSON.parse(response.data.checkServiceHealth);
            this.services[index].healthCheckLoading = false;
          } catch (e) {
            this.services[index].healthCheckError = 'Erreur lors du parsing de la réponse';
            this.services[index].healthCheckLoading = false;
          }
        },
        error: error => {
          this.services[index].healthCheckError = error?.graphQLErrors?.[0]?.message || error.message || 'Erreur lors de la vérification du service';
          this.services[index].healthCheckLoading = false;
        },
      })
    );
  }

  refreshHealthCheck(index: number): void {
    this.services[index].healthCheck = null;
    this.services[index].healthCheckError = null;
    this.checkServiceHealth(index);
  }

  toggleComponents(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }

  isExpanded(index: number): boolean {
    return this.expandedStates[index] || false;
  }
}
