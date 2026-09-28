import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceComponent } from './service.component';
import { ApiAdelaideServicePosdocService } from '@app/services/api-adelaide/admin/service/api-adelaide-service.service';
import { of, throwError } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client/core';
import { FindAllServicesInterface } from '@app/admin/service/model/service.interface';

describe('ServiceComponent', () => {
  let component: ServiceComponent;
  let fixture: ComponentFixture<ServiceComponent>;
  let apiAdelaideService: jasmine.SpyObj<ApiAdelaideServicePosdocService>;

  const mockServicesResponse: ApolloQueryResult<FindAllServicesInterface> = {
    data: {
      findAllServices: [
        {
          id: 1,
          libelle: 'Service 1',
          url: 'http://service1.com',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          createdBy: 'user1',
          updatedBy: 'user1',
        },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockHealthCheckResponse: ApolloQueryResult<any> = {
    data: {
      checkServiceHealth: JSON.stringify({ status: 'up' }),
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiAdelaideServicePosdocService', [
      'getAllServices',
      'checkServiceHealth',
    ]);

    await TestBed.configureTestingModule({
      declarations: [ServiceComponent],
      providers: [{ provide: ApiAdelaideServicePosdocService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceComponent);
    component = fixture.componentInstance;
    apiAdelaideService = TestBed.inject(ApiAdelaideServicePosdocService) as jasmine.SpyObj<ApiAdelaideServicePosdocService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllServices on init', () => {
    spyOn(component, 'getAllServices');
    component.ngOnInit();
    expect(component.getAllServices).toHaveBeenCalled();
  });

  it('should load services successfully', () => {
    apiAdelaideService.getAllServices.and.returnValue(of(mockServicesResponse));
    apiAdelaideService.checkServiceHealth.and.returnValue(of(mockHealthCheckResponse));

    component.getAllServices();

    expect(component.services.length).toBe(1);
    expect(component.services[0].healthCheckLoading).toBe(false);
  });

  it('should handle error when getting services', () => {
    apiAdelaideService.getAllServices.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');

    component.getAllServices();

    expect(console.error).toHaveBeenCalled();
    expect(component.services.length).toBe(0);
  });

  it('should update service health check on success', () => {
    component.services = [{
      id: 1,
      libelle: 'Service 1',
      url: 'http://service1.com',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'user1',
      updatedBy: 'user1',
      healthCheckLoading: false,
      healthCheckError: null,
      healthCheck: null,
    }];
    apiAdelaideService.checkServiceHealth.and.returnValue(of(mockHealthCheckResponse));

    component.checkServiceHealth(0);

    expect(component.services[0].healthCheck).toBeDefined();
    expect(component.services[0].healthCheckLoading).toBe(false);
  });

  it('should handle health check error', () => {
    component.services = [{
      id: 1,
      libelle: 'Service 1',
      url: 'http://service1.com',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'user1',
      updatedBy: 'user1',
      healthCheckLoading: false,
      healthCheckError: null,
      healthCheck: null,
    }];
    apiAdelaideService.checkServiceHealth.and.returnValue(throwError(() => new Error('Error')));

    component.checkServiceHealth(0);

    expect(component.services[0].healthCheckError).toBeDefined();
  });

  it('should refresh health check', () => {
    component.services = [{
      id: 1,
      libelle: 'Service 1',
      url: 'http://service1.com',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'user1',
      updatedBy: 'user1',
      healthCheckLoading: false,
      healthCheckError: 'error',
      healthCheck: { status: 'down' },
    }];
    spyOn(component, 'checkServiceHealth');

    component.refreshHealthCheck(0);

    expect(component.services[0].healthCheck).toBeNull();
    expect(component.services[0].healthCheckError).toBeNull();
  });

  it('should toggle expanded state', () => {
    component.expandedStates = [false];

    component.toggleComponents(0);

    expect(component.expandedStates[0]).toBe(true);
  });

  it('should return expanded state', () => {
    component.expandedStates = [true];

    expect(component.isExpanded(0)).toBe(true);
  });
});
