import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { AdresseRetourDetails } from '@app/models/adresseRetour';
import { CommunicationAdresseRetourService } from '@app/produit/adresse-retour/service/communication-adresse-retour.service';
import { TableauAdresseRetourService } from '@app/produit/adresse-retour/service/tableau-adresse-retour.service';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { PermissionService } from '@app/services/permission/permission.service';
import { DetailAdresseRetourComponent } from './detail-adresse-retour.component';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';

describe('DetailAdresseRetourComponent', () => {
  let component: DetailAdresseRetourComponent;
  let fixture: ComponentFixture<DetailAdresseRetourComponent>;

  let mockAdresseRetourService: jasmine.SpyObj<TableauAdresseRetourService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockCommunicationService: jasmine.SpyObj<CommunicationAdresseRetourService>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideAdresseRetourService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;

  const mockAdresseRetourDetail: AdresseRetourDetails = {
    codeEnv: 'ENV01',
    codeApp: 'APP01',
    codeCom: 'COM01',
    codeFich: 'FICH01',
    codeProd: 'PROD01',
    refImprime: 'IMP123',
    libFichier: 'Fichier Exemple',
    codeOrg: 'ORG01',
    codeAdr: 'ADR01',
    refFormat: 'FMT01',
    typeFormat: 'PDF',
    page: 1,
    codeClient: 'CLI01',
    typeMultif: 'MULTI',
    typeSupport: 'SUPPORT',
    typeSig: 'SIG01',
    refSupport: 'REFSUP01',
    eclatement: 1,
    codeDocument: 'DOC01',
  };

  beforeEach(async () => {
    mockAdresseRetourService = jasmine.createSpyObj('TableauAdresseRetourService', [
      'createGridConfiguration',
      'getDetailColumnDefs',
      'getOverlayNoRowsTemplate',
    ]);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockCommunicationService = jasmine.createSpyObj('CommunicationAdresseRetourService', ['callOtherComponentMethod']);
    mockApiService = jasmine.createSpyObj('ApiAdelaideAdresseRetourService', ['updateFichiersFromAdressesRetour']);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);

    await TestBed.configureTestingModule({
      declarations: [DetailAdresseRetourComponent],
      providers: [
        { provide: TableauAdresseRetourService, useValue: mockAdresseRetourService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: CommunicationAdresseRetourService, useValue: mockCommunicationService },
        { provide: ApiAdelaideAdresseRetourService, useValue: mockApiService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: PermissionService, useValue: permissionServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAdresseRetourComponent);
    component = fixture.componentInstance;

    // Valeurs par défaut
    mockAdresseRetourService.createGridConfiguration.and.returnValue({});
    mockAdresseRetourService.getDetailColumnDefs.and.returnValue([]);
    mockAdresseRetourService.getOverlayNoRowsTemplate.and.returnValue('Aucune donnée');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with agInit', () => {
    const mockParams = {
      data: {
        detail: [{ codeEnv: 'ENV1' }],
        newRow: true,
      },
    };

    component.agInit(mockParams as any);

    expect(component.rowData).toEqual([{ codeEnv: 'ENV1' }]);
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toEqual([]);
    expect(component.overlayNoRowsTemplate).toBe('Aucune donnée');
    expect(component.canPermPosition).toBe(-1);
  });

  it('should set gridApi on grid ready and fetch data', () => {
    const mockApi = {
      setGridOption: jasmine.createSpy('setGridOption'),
    };

    component.params = {
      data: {
        detail: [
          {
            codeEnv: 'ENV1',
            codeApp: 'APP1',
            codeCom: 'COM1',
            codeFich: 'FICH1',
            codeOrg: 'ORG1',
            codeProd: 'PROD1',
            refImprime: 'REF1',
            libFichier: 'Lib',
            typeFormat: 'PDF',
            typeMultif: 'MULTI',
            typeSupport: 'SUPPORT',
            typeSig: 'SIG',
            page: 1,
            eclatement: true,
          },
        ],
      },
    };

    const mockGridReadyEvent = {
      api: mockApi,
      columnApi: mockApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.onGridReady(mockGridReadyEvent);

    expect(mockApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.rowData[0].codeEnv).toEqual('ENV1');
    expect(mockApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should clear adresse on delete and call update', () => {
    const detail = [{ codeAdr: 123, codeEnv: 'ENV1' }];
    mockApiService.updateFichiersFromAdressesRetour.and.returnValue(of({}));

    spyOn(component as any, 'appelServiceUpdateFichiers');

    component.onDeleteRow(detail as any);
    expect(detail[0].codeAdr).toBeNull();
    expect((component as any).appelServiceUpdateFichiers).toHaveBeenCalled();
  });

  it('should call update service and handle success', () => {
    mockApiService.updateFichiersFromAdressesRetour.and.returnValue(of({}));

    component.appelServiceUpdateFichiers([mockAdresseRetourDetail]);

    expect(mockNotesService.show).toHaveBeenCalled();
    expect(mockCommunicationService.callOtherComponentMethod).toHaveBeenCalled();
  });

  it('should handle error from update service', () => {
    const error = { graphQLErrors: [{ message: 'Erreur serveur' }] };
    mockApiService.updateFichiersFromAdressesRetour.and.returnValue(throwError(() => error));

    component.appelServiceUpdateFichiers([mockAdresseRetourDetail]);

    component.asynchronousErrors$.subscribe(errMap => {
      expect(errMap.get(1)?.[0].message).toContain('Erreur serveur');
    });
  });

  it('should open popup and call communication service on success', () => {
    const fakeModalRef = {
      componentInstance: {
        adresseSelected: null,
        orgSelected: null,
        title: '',
        passEntry: of(1),
      },
    };

    mockModalService.open.and.returnValue(fakeModalRef as any);

    component.params = {
      data: {
        code: 'ADDR',
        codeOrganisme: 'ORG',
      },
    };

    component.openPopup();

    expect(fakeModalRef.componentInstance.adresseSelected).toBe('ADDR');
    expect(fakeModalRef.componentInstance.orgSelected).toBe('ORG');
    expect(mockCommunicationService.callOtherComponentMethod).toHaveBeenCalled();
  });

  it('should return false on refresh', () => {
    expect(component.refresh()).toBeFalse();
  });

  it('setError validity', () => {
    const errors = new Map<number, TableAsynchronousError[]>();
    const error: TableAsynchronousError = {
      isError: true,
      message: 'Test error message',
      id: null,
    };

    component.setError(1, error, errors);
    fixture.detectChanges();

    expect(errors.has(1)).toBe(true);
    expect(errors.get(1).length).toBe(1);
    expect(errors.get(1)[0]).toEqual(error);

    component.setError(1, error, errors);
  });
});
