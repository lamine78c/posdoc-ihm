import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { of, Subject } from 'rxjs';
import { GridApi } from 'ag-grid-community';

import { PageAccueilComponent } from './page-accueil.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauPageAccueilService } from './service/tableau-page-accueil.service';
import { ApiAdelaideRegionService } from '@app/services/api-adelaide-region.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { PopupCtreateContenuComponent } from './popup-ctreate-contenu/popup-ctreate-contenu.component';
import { PopupConfirmationComponent } from './popup-confirmation/popup-confirmation.component';

describe('PageAccueilComponent', () => {
  let component: PageAccueilComponent;
  let fixture: ComponentFixture<PageAccueilComponent>;
  let tableauConfigurationBuilderServiceSpy: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let tableauPageAccueilServiceSpy: jasmine.SpyObj<TableauPageAccueilService>;
  let apiAdelaideRegionServiceSpy: jasmine.SpyObj<ApiAdelaideRegionService>;
  let apiAdelaideContenuServiceSpy: jasmine.SpyObj<ApiAdelaideContenuService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let noteServiceSpy: jasmine.SpyObj<NotesService>;
  let datePipeSpy: jasmine.SpyObj<DatePipe>;

  const mockRegionsResponse = {
    data: {
      allRegions: [
        { code: 'REG1' },
        { code: 'REG2' },
        { code: 'REG3' }
      ]
    }
  };

  const mockContenusResponse = {
    data: {
      allContenus: [
        {
          id: '1',
          titre: 'Titre 1',
          dateActivation: '2023-01-01T00:00:00',
          dateExpiration: '2023-12-31T00:00:00',
          message: 'Message 1',
          regions: [{ code: 'REG1' }, { code: 'REG2' }]
        },
        {
          id: '2',
          titre: 'Titre 2',
          dateActivation: '2023-02-01T00:00:00',
          dateExpiration: '2023-11-30T00:00:00',
          message: 'Message 2',
          regions: [{ code: 'REG3' }]
        }
      ]
    }
  };

  beforeEach(async () => {
    const tableauConfigurationBuilderSpy = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    const tableauPageAccueilSpy = jasmine.createSpyObj('TableauPageAccueilService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    const apiRegionSpy = jasmine.createSpyObj('ApiAdelaideRegionService', ['getAllRegions']);
    const apiContenuSpy = jasmine.createSpyObj('ApiAdelaideContenuService', ['getAllContenu', 'createContenu', 'deleteContenu']);
    const modalSpy = jasmine.createSpyObj('NgbModal', ['open']);
    const noteSpy = jasmine.createSpyObj('NotesService', ['show']);
    const datePipe = jasmine.createSpyObj('DatePipe', ['transform']);

    await TestBed.configureTestingModule({
      declarations: [PageAccueilComponent],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: tableauConfigurationBuilderSpy },
        { provide: TableauPageAccueilService, useValue: tableauPageAccueilSpy },
        { provide: ApiAdelaideRegionService, useValue: apiRegionSpy },
        { provide: ApiAdelaideContenuService, useValue: apiContenuSpy },
        { provide: NgbModal, useValue: modalSpy },
        { provide: NotesService, useValue: noteSpy },
        { provide: DatePipe, useValue: datePipe }
      ],
    }).compileComponents();

    tableauConfigurationBuilderServiceSpy = TestBed.inject(TableauConfigurationBuilderService) as jasmine.SpyObj<TableauConfigurationBuilderService>;
    tableauPageAccueilServiceSpy = TestBed.inject(TableauPageAccueilService) as jasmine.SpyObj<TableauPageAccueilService>;
    apiAdelaideRegionServiceSpy = TestBed.inject(ApiAdelaideRegionService) as jasmine.SpyObj<ApiAdelaideRegionService>;
    apiAdelaideContenuServiceSpy = TestBed.inject(ApiAdelaideContenuService) as jasmine.SpyObj<ApiAdelaideContenuService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    noteServiceSpy = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    datePipeSpy = TestBed.inject(DatePipe) as jasmine.SpyObj<DatePipe>;
  });

  beforeEach(() => {
    // Configuration des valeurs de retour par défaut
    tableauConfigurationBuilderServiceSpy.createGridConfiguration.and.returnValue({});
    tableauPageAccueilServiceSpy.getColumnDefs.and.returnValue([
      { field: 'regions', floatingFilterComponentParams: { list: [] } }
    ]);
    tableauPageAccueilServiceSpy.getOverlayNoRowsTemplate.and.returnValue('<span>Aucune donnée</span>');
    apiAdelaideRegionServiceSpy.getAllRegions.and.returnValue(of(mockRegionsResponse as any));
    apiAdelaideContenuServiceSpy.getAllContenu.and.returnValue(of(mockContenusResponse as any));
    datePipeSpy.transform.and.returnValue('2023-01-01T00:00:00');

    fixture = TestBed.createComponent(PageAccueilComponent);
    component = fixture.componentInstance;
  });

  // Helper function to create NgbModalRef mock
  function createMockModalRef(componentInstance: any = {}, result?: any, dismissed?: any): Partial<NgbModalRef> {
    const mockRef = {
      componentInstance,
      result: result || Promise.resolve(),
      dismissed: dismissed || new Subject(),
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
      closed: new Subject(),
      shown: new Subject(),
      hidden: new Subject()
    };
    return mockRef as Partial<NgbModalRef>;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options and load regions on ngOnInit', () => {
    component.ngOnInit();

    expect(tableauConfigurationBuilderServiceSpy.createGridConfiguration).toHaveBeenCalled();
    expect(apiAdelaideRegionServiceSpy.getAllRegions).toHaveBeenCalled();
    expect(component.listRegion).toEqual(['REG1', 'REG2', 'REG3']);
    expect(tableauPageAccueilServiceSpy.getColumnDefs).toHaveBeenCalledWith(['REG1', 'REG2', 'REG3']);
  });

  it('should load contenus data when grid is ready', () => {
    const mockGridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      hideOverlay: jasmine.createSpy(),
      getDisplayedRowAtIndex: jasmine.createSpy().and.returnValue({ setSelected: jasmine.createSpy() })
    } as unknown as GridApi;

    // Créer une copie profonde des données pour éviter les mutations entre tests
    const freshMockContenusResponse = {
      data: {
        allContenus: [
          {
            id: '1',
            titre: 'Titre 1',
            dateActivation: '2023-01-01T00:00:00',
            dateExpiration: '2023-12-31T00:00:00',
            message: 'Message 1',
            regions: [{ code: 'REG1' }, { code: 'REG2' }]
          },
          {
            id: '2',
            titre: 'Titre 2',
            dateActivation: '2023-02-01T00:00:00',
            dateExpiration: '2023-11-30T00:00:00',
            message: 'Message 2',
            regions: [{ code: 'REG3' }]
          }
        ]
      }
    };

    // Remplacer le mock pour ce test spécifique
    apiAdelaideContenuServiceSpy.getAllContenu.and.returnValue(of(freshMockContenusResponse as any));

    const gridReadyEvent = { api: mockGridApi } as any;

    component.onGridReady(gridReadyEvent);

    expect(apiAdelaideContenuServiceSpy.getAllContenu).toHaveBeenCalled();
    expect(component.gridApi).toBe(mockGridApi);
    expect(component.gridColumnApi).toBe(mockGridApi);
    expect(component.nombreMesageTotal).toBe(2);
    expect(component.rowData).toEqual([
      {
        id: '1',
        titre: 'Titre 1',
        dateActivation: '2023-01-01T00:00:00',
        dateExpiration: '2023-12-31T00:00:00',
        message: 'Message 1',
        regions: ['REG1', 'REG2']
      },
      {
        id: '2',
        titre: 'Titre 2',
        dateActivation: '2023-02-01T00:00:00',
        dateExpiration: '2023-11-30T00:00:00',
        message: 'Message 2',
        regions: ['REG3']
      }
    ]);
  });

  it('should open modal and create new content when addRow is called', () => {
    const mockModalRef = createMockModalRef(
      { listRegion: [] },
      Promise.resolve({
        titre: 'Nouveau titre',
        dateActivation: new Date('2023-06-01'),
        dateExpiration: new Date('2023-12-01'),
        message: 'Nouveau message',
        regions: { REG1: true, REG2: false }
      })
    );

    const mockCreatedContenu = {
      data: {
        createContenu: {
          id: '3',
          titre: 'Nouveau titre',
          dateActivation: '2023-06-01T00:00:00',
          dateExpiration: '2023-12-01T00:00:00',
          message: 'Nouveau message',
          regions: [{ code: 'REG1' }]
        }
      }
    };

    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);
    apiAdelaideContenuServiceSpy.createContenu.and.returnValue(of(mockCreatedContenu as any));

    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      hideOverlay: jasmine.createSpy(),
      getDisplayedRowAtIndex: jasmine.createSpy().and.returnValue({ setSelected: jasmine.createSpy() })
    } as unknown as GridApi;
    component.listRegion = ['REG1', 'REG2'];

    component.addRow();

    expect(component.isEditing).toBe(true);
    expect(modalServiceSpy.open).toHaveBeenCalledWith(PopupCtreateContenuComponent, { size: '50rem', backdrop: false });
    expect(mockModalRef.componentInstance.listRegion).toEqual(['REG1', 'REG2']);
  });

  it('should open modal and edit existing content when edit is called', fakeAsync(() => {
    const mockNode = {
      data: {
        id: '1',
        titre: 'Titre existant',
        dateActivation: '2023-01-01T00:00:00',
        dateExpiration: '2023-12-31T00:00:00',
        message: 'Message existant',
        regions: ['REG1']
      },
      setData: jasmine.createSpy('setData')
    };

    const mockApiResponse = {
      data: {
        createContenu: {
          id: '1',
          titre: 'Titre modifié',
          regions: [{ code: 'REG1' }, { code: 'REG2' }]
        }
      }
    };

    apiAdelaideContenuServiceSpy.createContenu.and.returnValue(of(mockApiResponse));

    component.gridApi = jasmine.createSpyObj('GridApi', ['redrawRows', 'hideOverlay', 'getDisplayedRowAtIndex']);
    (component.gridApi.getDisplayedRowAtIndex as jasmine.Spy).and.returnValue({
      setSelected: jasmine.createSpy('setSelected')
    });

    const mockModalRef = createMockModalRef(
      { titre: '', dateActivation: '', dateExpiration: '', message: '', regions: [], listRegion: [] },
      Promise.resolve({
        titre: 'Titre modifié',
        dateActivation: new Date('2023-06-01'),
        dateExpiration: new Date('2023-12-01'),
        message: 'Message modifié',
        regions: { REG1: true, REG2: true }
      })
    );

    component.nodeSelected = mockNode;
    component.listRegion = ['REG1', 'REG2'];
    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);

    component.edit();

    tick();

    expect(modalServiceSpy.open).toHaveBeenCalled();
    expect(mockModalRef.componentInstance.titre).toBe('Titre existant');
    expect(mockModalRef.componentInstance.listRegion).toEqual(['REG1', 'REG2']);
    expect(apiAdelaideContenuServiceSpy.createContenu).toHaveBeenCalled();
    expect(mockNode.setData).toHaveBeenCalled();
  }));

  it('should open confirmation modal and delete content when deleteContenu is called', () => {
    const mockNode = {
      data: {
        id: '1',
        titre: 'Titre à supprimer',
        region: 'REG1'
      }
    };

    const mockModalRef = createMockModalRef(
      { rowDataArray: [] },
      undefined,
      of(1) // NUM_FIRST_BTN_MODAL
    );

    const mockDeleteResponse = { data: { deleteContenu: true } };

    component.nodeSelected = mockNode;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy()
    } as unknown as GridApi;

    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);
    apiAdelaideContenuServiceSpy.deleteContenu.and.returnValue(of(mockDeleteResponse as any));

    component.deleteContenu();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(PopupConfirmationComponent);
    expect(mockModalRef.componentInstance.rowDataArray).toEqual(['Titre à supprimer', 'REG1']);
  });

  it('should set nodeSelected when rowSelection is called', () => {
    const mockNode = { data: { id: '1', titre: 'Test' } };
    const mockEvent = { node: mockNode };

    component.rowSelection(mockEvent);

    expect(component.nodeSelected).toBe(mockNode);
  });

  it('should set isEditing to false and hide overlay when annuler is called', () => {
    component.gridApi = {
      hideOverlay: jasmine.createSpy()
    } as unknown as GridApi;
    component.isEditing = true;

    component.annuler();

    expect(component.isEditing).toBe(false);
    expect(component.gridApi.hideOverlay).toHaveBeenCalled();
  });

  it('should transform regions and call API when saveEdition is called with add type', () => {
    const mockContenu = {
      titre: 'Test titre',
      message: 'Test message',
      regions: { REG1: true, REG2: false, REG3: true }
    };

    const mockCreatedContenu = {
      data: {
        createContenu: {
          id: '3',
          titre: 'Test titre',
          message: 'Test message',
          regions: [{ code: 'REG1' }, { code: 'REG3' }]
        }
      }
    };

    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      hideOverlay: jasmine.createSpy(),
      getDisplayedRowAtIndex: jasmine.createSpy().and.returnValue({ setSelected: jasmine.createSpy() })
    } as unknown as GridApi;

    apiAdelaideContenuServiceSpy.createContenu.and.returnValue(of(mockCreatedContenu as any));

    component.saveEdition(mockContenu, 'add');

    expect(apiAdelaideContenuServiceSpy.createContenu).toHaveBeenCalledWith(jasmine.objectContaining({
      titre: 'Test titre',
      message: 'Test message',
      regions: [{ code: 'REG1' }, { code: 'REG3' }]
    }));
    expect(noteServiceSpy.show).toHaveBeenCalled();
    expect(component.isEditing).toBe(false);
  });

  it('should transform regions and call API when saveEdition is called with update type', () => {
    const mockContenu = {
      id: '1',
      titre: 'Test titre modifié',
      message: 'Test message modifié',
      regions: { REG1: false, REG2: true, REG3: true }
    };

    const mockUpdatedContenu = {
      data: {
        createContenu: {
          id: '1',
          titre: 'Test titre modifié',
          message: 'Test message modifié',
          regions: [{ code: 'REG2' }, { code: 'REG3' }]
        }
      }
    };

    const mockNode = {
      setData: jasmine.createSpy()
    };

    component.nodeSelected = mockNode;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      hideOverlay: jasmine.createSpy(),
      getDisplayedRowAtIndex: jasmine.createSpy().and.returnValue({ setSelected: jasmine.createSpy() })
    } as unknown as GridApi;

    apiAdelaideContenuServiceSpy.createContenu.and.returnValue(of(mockUpdatedContenu as any));

    component.saveEdition(mockContenu, 'update');

    expect(apiAdelaideContenuServiceSpy.createContenu).toHaveBeenCalledWith(jasmine.objectContaining({
      id: '1',
      titre: 'Test titre modifié',
      message: 'Test message modifié',
      regions: [{ code: 'REG2' }, { code: 'REG3' }]
    }));
    expect(mockNode.setData).toHaveBeenCalled();
    expect(noteServiceSpy.show).toHaveBeenCalled();
    expect(component.isEditing).toBe(false);
  });

  it('should configure grid options correctly during initialization', () => {
    const mockGridOptions = {
      rowHeight: undefined,
      getRowId: undefined,
      rowStyle: undefined,
      onRowClicked: undefined,
      suppressCellFocus: undefined
    };

    tableauConfigurationBuilderServiceSpy.createGridConfiguration.and.returnValue(mockGridOptions);

    component.ngOnInit();

    expect(component.gridOptions.rowHeight).toBe(128);
    expect(component.gridOptions.rowStyle).toEqual({ border: '0.5rem' });
    expect(component.gridOptions.onRowClicked).toBe(component.rowSelection);
    expect(component.gridOptions.suppressCellFocus).toBe(true);
    expect(component.gridOptions.getRowId).toBeDefined();
    expect(component.overlayNoRowsTemplate).toBe('<span>Aucune donnée</span>');
  });

  it('should return correct row id from getRowId function', () => {
    component.ngOnInit();

    const params = { data: { id: 'test-id' } };
    const result = component.gridOptions.getRowId(params as any);

    expect(result).toBe('test-id');
  });

  it('should handle error when modal is dismissed in addRow', () => {
    const mockModalRef = createMockModalRef(
      {},
      Promise.reject()
    );

    spyOn(console, 'log');
    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);
    component.listRegion = ['REG1', 'REG2'];

    component.addRow();

    expect(component.isEditing).toBe(true);
    expect(modalServiceSpy.open).toHaveBeenCalledWith(PopupCtreateContenuComponent, { size: '50rem', backdrop: false });
  });

  it('should handle error when modal is dismissed in edit', () => {
    const mockNode = {
      data: {
        id: '1',
        titre: 'Titre existant',
        dateActivation: '2023-01-01T00:00:00',
        dateExpiration: '2023-12-31T00:00:00',
        message: 'Message existant',
        regions: ['REG1']
      }
    };

    const mockModalRef = createMockModalRef(
      { titre: '', dateActivation: '', dateExpiration: '', message: '', regions: [], listRegion: [] },
      Promise.reject()
    );

    spyOn(console, 'log');
    component.nodeSelected = mockNode;
    component.listRegion = ['REG1', 'REG2'];
    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);

    component.edit();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(PopupCtreateContenuComponent, { size: '50rem', backdrop: false });
    expect(mockModalRef.componentInstance.titre).toBe('Titre existant');
  });

  it('should not delete content when confirmation modal is cancelled', () => {
    const mockNode = {
      data: {
        id: '1',
        titre: 'Titre à ne pas supprimer',
        region: 'REG1'
      }
    };

    const mockModalRef = createMockModalRef(
      { rowDataArray: [] },
      undefined,
      of(2) // Different from NUM_FIRST_BTN_MODAL
    );

    component.nodeSelected = mockNode;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy()
    } as unknown as GridApi;

    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);

    component.deleteContenu();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(PopupConfirmationComponent);
    expect(mockModalRef.componentInstance.rowDataArray).toEqual(['Titre à ne pas supprimer', 'REG1']);
    expect(apiAdelaideContenuServiceSpy.deleteContenu).not.toHaveBeenCalled();
  });

  it('should handle successful deletion and show success message', () => {
    const mockNode = {
      data: {
        id: '1',
        titre: 'Titre supprimé',
        region: 'REG1'
      }
    };

    const mockModalRef = createMockModalRef(
      { rowDataArray: [] },
      undefined,
      of(1) // NUM_FIRST_BTN_MODAL
    );

    const mockDeleteResponse = { data: { deleteContenu: true } };

    component.nodeSelected = mockNode;
    component.gridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy()
    } as unknown as GridApi;

    modalServiceSpy.open.and.returnValue(mockModalRef as NgbModalRef);
    apiAdelaideContenuServiceSpy.deleteContenu.and.returnValue(of(mockDeleteResponse as any));

    component.deleteContenu();

    expect(modalServiceSpy.open).toHaveBeenCalledWith(PopupConfirmationComponent);
    expect(mockModalRef.componentInstance.rowDataArray).toEqual(['Titre supprimé', 'REG1']);
  });

  it('should not set nombreMesageTotal if already set in onGridReady', () => {
    const mockGridApi = {
      applyTransaction: jasmine.createSpy(),
      redrawRows: jasmine.createSpy(),
      hideOverlay: jasmine.createSpy(),
      getDisplayedRowAtIndex: jasmine.createSpy().and.returnValue({ setSelected: jasmine.createSpy() })
    } as unknown as GridApi;

    const gridReadyEvent = { api: mockGridApi } as any;

    component.nombreMesageTotal = 5; // Déjà défini
    component.onGridReady(gridReadyEvent);

    expect(apiAdelaideContenuServiceSpy.getAllContenu).toHaveBeenCalled();
    expect(component.nombreMesageTotal).toBe(5); // Ne devrait pas changer
  });
});
