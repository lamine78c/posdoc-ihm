import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AideComponent } from './aide.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauAideService } from './service/tableau-aide.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { StatusColumnHandlerService } from '@app/admin/contenu/services/status-column-handler.service';
import { of, throwError } from 'rxjs';
import { HelpStatusType } from '@app/models/contenu-for-accueil';
import { ColDef } from 'ag-grid-community';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AideComponent', () => {
  let component: AideComponent;
  let fixture: ComponentFixture<AideComponent>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauAideService: jasmine.SpyObj<TableauAideService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockApiAdelaideContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;
  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockStatusColumnHandler: jasmine.SpyObj<StatusColumnHandlerService>;

  const mockAides = [
    {
      id: 1,
      path: '/admin/aide',
      message: 'Test message',
      state: HelpStatusType.DRAFT,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      createdBy: 'user1',
      updatedBy: 'user1'
    },
    {
      id: 2,
      path: '/admin/test',
      message: 'Test message 2',
      state: HelpStatusType.ENABLED,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      createdBy: 'user2',
      updatedBy: 'user2'
    }
  ];

  beforeEach(async () => {
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockTableauAideService = jasmine.createSpyObj('TableauAideService', ['getColumnDefs', 'getOverlayNoRowsTemplate']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiAdelaideContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', [
      'getAllAides',
      'getAllPathComplet',
      'createAide',
      'updateAide',
      'deleteAide',
      'changeStateHelp'
    ]);
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockStatusColumnHandler = jasmine.createSpyObj('StatusColumnHandlerService', ['setupStatusColumnHandler', 'changeStatus']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({
      suppressCellFocus: true
    } as any);
    mockTableauAideService.getColumnDefs.and.returnValue([
      { field: 'status', headerName: 'Etat' } as ColDef
    ]);
    mockTableauAideService.getOverlayNoRowsTemplate.and.returnValue('<span>No rows</span>');
    mockApiAdelaideContenuService.getAllAides.and.returnValue(of({
      data: { searchAll: mockAides }
    } as any));
    mockApiAdelaideContenuService.getAllPathComplet.and.returnValue(of({
      data: {
        getAllPathComplet: [
          { path: '/admin/aide', libelle: 'Administration > Aide' },
          { path: '/admin/test', libelle: 'Administration > Test' }
        ]
      }
    } as any));

    await TestBed.configureTestingModule({
      declarations: [AideComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauAideService, useValue: mockTableauAideService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: ApiAdelaideContenuService, useValue: mockApiAdelaideContenuService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: StatusColumnHandlerService, useValue: mockStatusColumnHandler }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AideComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize grid options and column definitions', () => {
      fixture.detectChanges();

      expect(component.gridOptions).toBeDefined();
      expect(component.columnDefs).toBeDefined();
      expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(false);
      expect(mockTableauAideService.getColumnDefs).toHaveBeenCalledWith(false);
    });

    it('should setup status column handler', () => {
      fixture.detectChanges();

      expect(mockStatusColumnHandler.setupStatusColumnHandler).toHaveBeenCalledWith(
        component.columnDefs,
        component,
        jasmine.objectContaining({
          draftValue: 'draft',
          enabledValue: 'enabled',
          disabledValue: 'disabled'
        })
      );
    });
  });

  describe('onGridReady', () => {
    it('should set gridApi and load aides', () => {
      const mockParams = {
        api: jasmine.createSpyObj('GridApi', ['setRowData'])
      };

      component.onGridReady(mockParams as any);

      expect(component.gridApi).toBe(mockParams.api);
      expect(mockApiAdelaideContenuService.getAllAides).toHaveBeenCalled();
    });

    it('should map aides to row data correctly', () => {
      fixture.detectChanges(); // Trigger ngOnInit to load pathLabels and pathOrder

      const mockParams = {
        api: jasmine.createSpyObj('GridApi', ['setRowData'])
      };

      component.onGridReady(mockParams as any);

      expect(component.rowData.length).toBe(2);
      expect(component.rowData[0].id).toBe(1);
      expect(component.rowData[0].path).toBe('/admin/aide');
      expect(component.rowData[0].pathLabel).toBe('Administration > Aide');
      expect(component.rowData[0].pathOrder).toBe(0);
      expect(component.rowData[0].status).toBe('draft');
      expect(component.rowData[0].created_by).toBe('user1');
      expect(component.rowData[0].updated_by).toBe('user1');
      expect(component.rowData[1].status).toBe('enabled');
      expect(component.rowData[1].pathLabel).toBe('Administration > Test');
      expect(component.rowData[1].pathOrder).toBe(1);
    });
  });

  describe('addRow', () => {
    it('should open modal and create aide on success', fakeAsync(() => {
      const mockModalRef = {
        result: Promise.resolve({ path: '/test', message: 'Test' })
      };
      mockModalService.open.and.returnValue(mockModalRef as any);
      mockApiAdelaideContenuService.createAide.and.returnValue(of({
        data: { createHelp: [mockAides[0]] }
      } as any));

      component.addRow();

      tick();

      expect(mockModalService.open).toHaveBeenCalled();
      expect(mockApiAdelaideContenuService.createAide).toHaveBeenCalledWith({
        path: '/test',
        message: 'Test'
      });
      expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
        category: ToastCategoryEnum.SUCCESS
      }));
    }));

    it('should show error notification on create failure', fakeAsync(() => {
      const mockModalRef = {
        result: Promise.resolve({ path: '/test', message: 'Test' })
      };
      mockModalService.open.and.returnValue(mockModalRef as any);

      mockApiAdelaideContenuService.createAide.and.returnValue(
        throwError(() => new Error('Error creating aide'))
      );

      component.addRow();

      tick();

      expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
        category: ToastCategoryEnum.ERROR
      }));
    }));
  });

  describe('edit', () => {
    const mockEvent = {
      data: {
        id: 1,
        path: '/test',
        message: 'Test',
        status: 'draft'
      }
    };

    it('should open edit modal for draft status', (done) => {
      component.rowData = [
        { id: 1, path: '/test', message: 'Test', status: 'draft' }
      ];
      const mockModalRef = {
        result: Promise.resolve({ id: 1, path: '/test', message: 'Updated' }),
        componentInstance: {}
      };
      mockModalService.open.and.returnValue(mockModalRef as any);
      mockApiAdelaideContenuService.updateAide.and.returnValue(of({
        data: { updateHelp: [mockAides[0]] }
      } as any));

      component.edit(mockEvent);

      expect(mockModalService.open).toHaveBeenCalled();
      mockModalRef.result.then(() => {
        expect(mockApiAdelaideContenuService.updateAide).toHaveBeenCalled();
        done();
      });
    });

    it('should show confirmation for activated aide', () => {
      const enabledEvent = {
        data: { ...mockEvent.data, status: 'enabled' }
      };
      component.rowData = [
        { id: 1, path: '/test', message: 'Test', status: 'enabled' }
      ];
      const mockModalRef = {
        dismissed: of(2),
        componentInstance: {}
      };
      mockModalService.open.and.returnValue(mockModalRef as any);

      component.edit(enabledEvent);

      expect(mockModalService.open).toHaveBeenCalled();
    });
  });

  describe('onDeleteRows', () => {
    beforeEach(() => {
      component.gridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    });

    it('should delete aide and show success message', () => {
      const aidesToDelete = [{ id: 1, path: '/test', pathLabel: 'Administration > Test' }];
      mockApiAdelaideContenuService.deleteAide.and.returnValue(of({ data: { ok: true } } as any));

      component.onDeleteRows(aidesToDelete);

      expect(mockApiAdelaideContenuService.deleteAide).toHaveBeenCalledWith(1);
      expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
        category: ToastCategoryEnum.SUCCESS
      }));
    });

    it('should show error message on delete failure', () => {
      const aidesToDelete = [{ id: 1, path: '/test', pathLabel: 'Administration > Test' }];
      mockApiAdelaideContenuService.deleteAide.and.returnValue(
        throwError(() => ({ message: 'Error deleting aide' }))
      );

      component.onDeleteRows(aidesToDelete);

      expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
        category: ToastCategoryEnum.ERROR
      }));
    });
  });

  xdescribe('statusCellRenderer - DEPRECATED: moved to StatusColumnHandlerService', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return select with disabled Brouillon option and only Activé option for draft status', () => {
      const params = { data: { status: 'draft' } };
      const result = (component as any).statusCellRenderer(params);

      expect(result.tagName).toBe('DIV');
      const select = result.querySelector('select');
      expect(select).toBeTruthy();

      const options = select.querySelectorAll('option');
      expect(options.length).toBe(2); // Brouillon (disabled) + Activé

      const draftOption = select.querySelector('option[value="draft"]');
      expect(draftOption).toBeTruthy();
      expect(draftOption.text).toBe('Brouillon');
      expect(draftOption.disabled).toBe(true);
      expect(draftOption.selected).toBe(true);

      const enabledOption = select.querySelector('option[value="enabled"]');
      expect(enabledOption).toBeTruthy();
      expect(enabledOption.text).toBe('Activé');

      const disabledOption = select.querySelector('option[value="disabled"]');
      expect(disabledOption).toBeFalsy(); // Ne doit pas exister pour les brouillons
    });

    it('should return select element with both Activé and Désactivé options for enabled status', () => {
      const params = { data: { status: 'enabled' } };
      const result = (component as any).statusCellRenderer(params);

      expect(result.tagName).toBe('DIV');
      const select = result.querySelector('select');
      expect(select).toBeTruthy();
      expect(select.value).toBe('enabled');

      const options = select.querySelectorAll('option');
      expect(options.length).toBe(2); // Activé + Désactivé
    });

    it('should return select element with both Activé and Désactivé options for disabled status', () => {
      const params = { data: { status: 'disabled' } };
      const result = (component as any).statusCellRenderer(params);

      expect(result.tagName).toBe('DIV');
      const select = result.querySelector('select');
      expect(select).toBeTruthy();
      expect(select.value).toBe('disabled');

      const options = select.querySelectorAll('option');
      expect(options.length).toBe(2); // Activé + Désactivé
    });
  });

  xdescribe('onStatusCellClicked - DEPRECATED: moved to StatusColumnHandlerService', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show confirmation modal when activating draft with existing enabled aide', (done) => {
      component.rowData = [
        { id: 1, path: '/test', status: 'draft' },
        { id: 2, path: '/test', status: 'enabled' }
      ];

      const mockSelect = { value: 'enabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'draft' }
      };
      const mockApi = jasmine.createSpyObj('GridApi', ['redrawRows']);
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode,
        api: mockApi
      };

      const mockModalRef = {
        dismissed: of(2),
        componentInstance: {}
      };
      mockModalService.open.and.returnValue(mockModalRef as any);

      (component as any).onStatusCellClicked(param);

      setTimeout(() => {
        expect(mockModalService.open).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should activate draft when user confirms the modal', fakeAsync(() => {
      component.rowData = [
        { id: 1, path: '/test', status: 'draft' },
        { id: 2, path: '/test', status: 'enabled' }
      ];

      const mockSelect = { value: 'enabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'draft' }
      };
      const mockApi = jasmine.createSpyObj('GridApi', ['redrawRows']);
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode,
        api: mockApi
      };

      mockApiAdelaideContenuService.changeStateHelp.and.returnValue(of({
        data: { changeStateHelp: mockAides }
      } as any));

      const mockModalRef = {
        dismissed: of(111), // NUM_FIRST_BTN_MODAL = 111
        componentInstance: {}
      };
      mockModalService.open.and.returnValue(mockModalRef as any);

      (component as any).onStatusCellClicked(param);

      // Avancer le temps pour que l'observable dismissed émette
      tick();

      expect(mockApiAdelaideContenuService.changeStateHelp).toHaveBeenCalledWith(1);
      expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
        category: ToastCategoryEnum.SUCCESS
      }));
    }));

    it('should cancel activation when user dismisses the modal', (done) => {
      component.rowData = [
        { id: 1, path: '/test', status: 'draft' },
        { id: 2, path: '/test', status: 'enabled' }
      ];

      const mockSelect = { value: 'enabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'draft' }
      };
      const mockApi = jasmine.createSpyObj('GridApi', ['redrawRows']);
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode,
        api: mockApi
      };

      const mockModalRef = {
        dismissed: of(2), // Cancel button (not NUM_FIRST_BTN_MODAL)
        componentInstance: {}
      };
      mockModalService.open.and.returnValue(mockModalRef as any);

      (component as any).onStatusCellClicked(param);

      setTimeout(() => {
        expect(mockApiAdelaideContenuService.changeStateHelp).not.toHaveBeenCalled();
        expect(mockApi.redrawRows).toHaveBeenCalledWith({ rowNodes: [mockNode] });
        expect(mockNode.data.status).toBe('draft');
        done();
      }, 50);
    });

    it('should call changeStateHelp directly when activating draft without existing enabled aide', (done) => {
      component.rowData = [
        { id: 1, path: '/test', status: 'draft' }
      ];

      const mockSelect = { value: 'enabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'draft' }
      };
      const mockApi = jasmine.createSpyObj('GridApi', ['redrawRows']);
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode,
        api: mockApi
      };

      mockApiAdelaideContenuService.changeStateHelp.and.returnValue(of({
        data: { changeStateHelp: mockAides }
      } as any));

      (component as any).onStatusCellClicked(param);

      setTimeout(() => {
        expect(mockApiAdelaideContenuService.changeStateHelp).toHaveBeenCalledWith(1);
        expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
          category: ToastCategoryEnum.SUCCESS
        }));
        done();
      }, 0);
    });

    it('should call changeStateHelp and update row data on success for enabled to disabled', (done) => {
      const mockSelect = { value: 'disabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'enabled' }
      };
      const mockApi = jasmine.createSpyObj('GridApi', ['redrawRows']);
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode,
        api: mockApi
      };

      mockApiAdelaideContenuService.changeStateHelp.and.returnValue(of({
        data: { changeStateHelp: mockAides }
      } as any));

      (component as any).onStatusCellClicked(param);

      setTimeout(() => {
        expect(mockApiAdelaideContenuService.changeStateHelp).toHaveBeenCalledWith(1);
        expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
          category: ToastCategoryEnum.SUCCESS
        }));
        expect(component.rowData.length).toBe(2);
        done();
      }, 0);
    });

    it('should show error notification on changeStateHelp failure', (done) => {
      const mockSelect = { value: 'enabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'draft' }
      };
      const mockApi = jasmine.createSpyObj('GridApi', ['redrawRows']);
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode,
        api: mockApi
      };

      mockApiAdelaideContenuService.changeStateHelp.and.returnValue(
        throwError(() => ({ graphQLErrors: [{ message: 'Error' }] }))
      );

      (component as any).onStatusCellClicked(param);

      setTimeout(() => {
        expect(mockNotesService.show).toHaveBeenCalledWith(jasmine.objectContaining({
          category: ToastCategoryEnum.ERROR
        }));
        expect(mockApi.redrawRows).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not call API if status has not changed', () => {
      const mockSelect = { value: 'enabled', tagName: 'SELECT' };
      const mockEvent = { target: mockSelect };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'enabled' }
      };
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode
      };

      (component as any).onStatusCellClicked(param);

      expect(mockApiAdelaideContenuService.changeStateHelp).not.toHaveBeenCalled();
    });

    it('should not call API if target is not a SELECT', () => {
      const mockDiv = document.createElement('div');
      const mockEvent = { target: mockDiv };
      const mockNode = {
        data: { id: 1, path: '/test', status: 'draft' }
      };
      const param = {
        event: mockEvent,
        data: mockNode.data,
        node: mockNode
      };

      (component as any).onStatusCellClicked(param);

      expect(mockApiAdelaideContenuService.changeStateHelp).not.toHaveBeenCalled();
    });
  });

  xdescribe('normalizeSelectValue - DEPRECATED: moved to StatusColumnHandlerService', () => {
    it('should extract value after colon', () => {
      const result = (component as any).normalizeSelectValue('label: enabled');
      expect(result).toBe('enabled');
    });

    it('should return original value if no colon', () => {
      const result = (component as any).normalizeSelectValue('enabled');
      expect(result).toBe('enabled');
    });
  });

  describe('onPageClick', () => {
    it('should open PopupHelpComponent with path and message', () => {
      component.rowData = [
        {
          id: 1,
          path: '/admin/test',
          pathLabel: 'Administration > Test',
          pathOrder: 0,
          message: 'Test message content',
          status: 'enabled',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'user1',
          updated_by: 'user2',
        }
      ];
      const mockModalRef = {
        componentInstance: {}
      };
      mockModalService.open.and.returnValue(mockModalRef as any);

      component.onPageClick(1);

      expect(mockModalService.open).toHaveBeenCalled();
      expect(mockModalRef.componentInstance).toEqual({
        path: '/admin/test',
        aideMessage: 'Test message content'
      });
    });
  });
});
