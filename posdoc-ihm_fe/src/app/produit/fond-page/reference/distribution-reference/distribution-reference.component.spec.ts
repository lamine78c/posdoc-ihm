import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApolloQueryResult } from '@apollo/client/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { ApiAdelaideImprimeService } from '@app/services/api-adelaide-imprime.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_MODIFIER_AUTH } from '@app/services/permission/PermissionsFile';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { TableauReferenceService } from '../service/tableau-reference.service';
import { DistributionReferenceComponent } from './distribution-reference.component';

describe('DistributionReferenceComponent', () => {
  let component: DistributionReferenceComponent;
  let fixture: ComponentFixture<DistributionReferenceComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauService: jasmine.SpyObj<TableauReferenceService>;
  let mockApiAdelaideFichierService: jasmine.SpyObj<ApiAdelaideFichierService>;
  let mockApiAdelaideImprimeService: jasmine.SpyObj<ApiAdelaideImprimeService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  const mockDataSearch = {
    data: {
      getFichiersForUpdatingReference: [],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockDataConfig = {
    data: {
      allOrganismes: [{ code: '117' }, { code: '116' }],
      allImprimes: [{ reference: 'test' }, { reference: 'testB' }],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockColumnDefs = [
    { headerName: 'Organisme', field: 'codeOrg', floatingFilterComponentParams: { selectData: null } },
    { headerName: 'Référence imprimé', field: 'refImprime', cellRendererParams: { selectData: null } },
  ];

  beforeEach(waitForAsync(() => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['show']);
    const tableauConfigSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration', 'getNoDataMessage']);
    const apiAdelaideImprimeSpy = jasmine.createSpyObj('ApiAdelaideImprimeService', ['updateFichiersFromFondDePage']);
    const apiAdelaideFichierSpy = jasmine.createSpyObj('ApiAdelaideFichierService', ['findFichiersForUpdatingReference', 'getAllSelectConfig']);
    const tableauServiceSpy = jasmine.createSpyObj('TableauReferenceService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      declarations: [DistributionReferenceComponent],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigSpy },
        { provide: ApiAdelaideImprimeService, useValue: apiAdelaideImprimeSpy },
        { provide: ApiAdelaideFichierService, useValue: apiAdelaideFichierSpy },
        { provide: TableauReferenceService, useValue: tableauServiceSpy },
        { provide: PermissionService, useValue: permissionSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
      ],
    }).compileComponents();

    mockNotesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    mockTableauConfigurationBuilderService = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    mockApiAdelaideImprimeService = TestBed.inject(ApiAdelaideImprimeService) as jasmine.SpyObj<ApiAdelaideImprimeService>;
    mockApiAdelaideFichierService = TestBed.inject(ApiAdelaideFichierService) as jasmine.SpyObj<ApiAdelaideFichierService>;
    mockTableauService = TestBed.inject(TableauReferenceService) as jasmine.SpyObj<TableauReferenceService>;
    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockModalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  }));

  beforeEach(() => {
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauService.getOverlayNoRowsTemplate.and.returnValue('nodata');
    mockPermissionService.hasActionDeMasse.and.returnValue(true);
    mockApiAdelaideFichierService.findFichiersForUpdatingReference.and.returnValue(of(mockDataSearch));
    mockApiAdelaideFichierService.getAllSelectConfig.and.returnValue(of(mockDataConfig));
    fixture = TestBed.createComponent(DistributionReferenceComponent);
    component = fixture.componentInstance;
    component.gridApi = {
      setGridOption: jasmine.createSpy(),
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      forEachNode: jasmine.createSpy('forEachNode').and.callFake((callback: (node: any) => void) => {
        [
          {
            data: {
              codeEnv: 'P',
              codeOrg: '117',
              codeApp: 'MAS',
              codeCom: 'AD04',
              codeFich: 'L00',
            },
          },
          {
            data: {
              codeEnv: 'P',
              codeOrg: '116',
              codeApp: 'snv2',
              codeCom: 'AD04',
              codeFich: 'L01',
            },
          },
        ].forEach(callback);
      }),
      showNoRowsOverlay: jasmine.createSpy(),
      setFilterModel: jasmine.createSpy('setFilterModel'),
      onFilterChanged: jasmine.createSpy('onFilterChanged'),
      refreshHeader: jasmine.createSpy('refreshHeader'),
      resetColumnState: jasmine.createSpy('resetColumnState'),
    } as unknown as GridApi;
  });

  it('should initialize grid options and column definitions on ngOnInit', () => {
    fixture.detectChanges();
    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(mockTableauService.getColumnDefs).toHaveBeenCalledWith(true);
    expect(mockTableauService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.gridOptions).toBeDefined();
    expect(component.columnDefs).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('nodata');
  });

  it('should set correct permission properties', () => {
    fixture.detectChanges();
    expect(component.canEditPermPosition).toBe(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES[KEY_MODIFIER_AUTH]);
  });

  it('should load data on grid ready', () => {
    const mockParams = {
      api: component.gridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent;

    component.onGridReady(mockParams);
    fixture.detectChanges();

    expect(mockApiAdelaideFichierService.getAllSelectConfig).toHaveBeenCalled();
    expect(component.imprimes.length).toEqual(2);
  });

  it('should search correctly', () => {
    component.lister({
      codesEnv: ['117'],
      codesApp: ['test'],
      refsImp: ['test'],
    });
    fixture.detectChanges();
    expect(mockApiAdelaideFichierService.findFichiersForUpdatingReference).toHaveBeenCalledWith(['117'], ['test'], ['test']);
    expect(component.nombreReferencesTotal).toBe(0);
    expect(mockTableauConfigurationBuilderService.getNoDataMessage).toHaveBeenCalled();
  });

  it('should not update', () => {
    const editedRowMap = new Map();
    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();
    expect(mockApiAdelaideImprimeService.updateFichiersFromFondDePage).not.toHaveBeenCalled();
  });

  it('should update existing row successfully', () => {
    const updateRow = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      codeEnv: 'P',
      codeOrg: '117',
      codeApp: 'MAS',
      codeCom: 'AD04',
      codeFich: 'L00',
      key: null,
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const updateResponse: ApolloQueryResult<any> = {
      data: { updateFichiersFromFondDePage: [updateRow] },
      loading: false,
      networkStatus: 7,
    };
    mockApiAdelaideImprimeService.updateFichiersFromFondDePage.and.returnValue(of(updateResponse));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(mockApiAdelaideImprimeService.updateFichiersFromFondDePage).toHaveBeenCalledWith([updateRow]);
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'La référence du fichie "AD04-L00" a été mise à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should handle update error', () => {
    const updateRow = {
      reference: 'test',
      libelle: 'test',
      codeRND: '',
      codeEnv: 'P',
      codeOrg: '117',
      codeApp: 'MAS',
      codeCom: 'AD04',
      codeFich: 'L00',
    };
    const editedRowMap = new Map([[1, updateRow]]);
    const error = { graphQLErrors: [{ message: 'Erreur de la modification' }] };
    mockApiAdelaideImprimeService.updateFichiersFromFondDePage.and.returnValue(throwError(error));

    component.onSaveEdition(editedRowMap);
    fixture.detectChanges();

    expect(component.asynchronousErrors$.value.has(1)).toBe(true);
  });

  it('should open popup and call communication service on success', () => {
    const fakeModalRef = jasmine.createSpyObj('modalRef', ['close']);
    fakeModalRef.componentInstance = {
      modalRef: null,
      imprimes: null,
      imprimeSelected: null,
      title: '',
      passEntry: of('testB'),
    };
    mockModalService.open.and.returnValue(fakeModalRef);
    const selectedNodesAndMode = {
      selectedNodes: [
        {
          data: {
            refImprime: 'testA',
            codeEnv: 'P',
          },
        },
        {
          data: {
            refImprime: 'testA',
            codeEnv: 'T',
          },
        },
      ],
    };
    const updateResponse: ApolloQueryResult<any> = {
      data: { updateFichiersFromFondDePage: [] },
      loading: false,
      networkStatus: 7,
    };
    component.imprimes = 'refimp';
    component.nombreReferencesTotal = 2;
    mockApiAdelaideImprimeService.updateFichiersFromFondDePage.and.returnValue(of(updateResponse));

    component.openAddPopup(selectedNodesAndMode);
    fixture.detectChanges();

    expect(fakeModalRef.componentInstance.imprimeSelected).toEqual('testA');
    expect(fakeModalRef.componentInstance.imprimes).toEqual('refimp');
    expect(fakeModalRef.componentInstance.modalRef).not.toBeNull();
    expect(mockApiAdelaideImprimeService.updateFichiersFromFondDePage).toHaveBeenCalled();
    expect(component.synchroniseReferenceList).toEqual({
      isListOfReferenceEmpty: true,
      environnementsUpdated: ['P', 'T'],
      newReference: 'testB',
    });
    expect(fakeModalRef.close).toHaveBeenCalled();
    expect(mockNotesService.show).toHaveBeenCalledWith({
      title: 'Les références ont été mises à jour avec succès',
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  });

  it('should change showSearch value to false', () => {
    component.reduireSearchDiv({});
    fixture.detectChanges();
    expect(component.showSearch).toBeFalsy();
  });

  it('should change showSearch value to true', () => {
    component.showSearchDiv({});
    fixture.detectChanges();
    expect(component.showSearch).toBeTruthy();
  });
});
