import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifDetailsComponent } from './tarif-details.component';
import { of, throwError } from 'rxjs';
import { GridApi } from 'ag-grid-community';
import { ApiAdelaideTarifService } from '@app/services/api-adelaide-tarif.service';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { TableauTarifService } from '@app/admin/tarif/service/tableau-tarif.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { PermissionService } from '@app/services/permission/permission.service';

describe('TarifDetailsComponent', () => {
  let component: TarifDetailsComponent;
  let fixture: ComponentFixture<TarifDetailsComponent>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;

  let apiAdelaideServiceMock: any;
  let notesServiceMock: any;
  let tableauTarifServiceMock: any;
  let tableauBuilderMock: any;

  beforeEach(() => {
    apiAdelaideServiceMock = {
      createTarif: jasmine.createSpy(),
      updateTarif: jasmine.createSpy(),
      deleteTarifs: jasmine.createSpy(),
      getTarifByType: jasmine.createSpy().and.returnValue(
        of({
          data: {
            getTarifsById: [{ id: 1, libelle: 'Tarif 1' }],
          },
        })
      ),
    };

    notesServiceMock = {
      show: jasmine.createSpy(),
    };

    tableauTarifServiceMock = {
      getDetailColumnDefs: jasmine.createSpy().and.returnValue([]),
      getOverlayNoRowsTemplate: jasmine.createSpy().and.returnValue('Aucune ligne'),
    };

    tableauBuilderMock = {
      createGridConfiguration: jasmine.createSpy().and.returnValue({}),
    };
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission','hasActionDeMasse']);
    TestBed.configureTestingModule({
      declarations: [TarifDetailsComponent],
      providers: [
        { provide: ApiAdelaideTarifService, useValue: apiAdelaideServiceMock },
        { provide: NotesService, useValue: notesServiceMock },
        { provide: TableauTarifService, useValue: tableauTarifServiceMock },
        { provide: TableauConfigurationBuilderService, useValue: tableauBuilderMock },
        { provide: PermissionService, useValue: permissionServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TarifDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSaveEdition', () => {
    beforeEach(() => {
      component.gridApi = { forEachNode: jasmine.createSpy(), redrawRows: jasmine.createSpy() } as unknown as GridApi;
      component.type = 'SOME_TYPE';
    });

    it('should create a new tarif and show success notification', () => {
      const newTarif = { newRow: true };
      const editedRow = new Map<number, any>([[1, newTarif]]);
      apiAdelaideServiceMock.createTarif.and.returnValue(
        of({
          data: { createTarif: { type: 'SOME_TYPE' } },
        })
      );

      component.onSaveEdition(editedRow);

      expect(apiAdelaideServiceMock.createTarif).toHaveBeenCalled();
      expect(notesServiceMock.show).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: jasmine.stringMatching(/créé avec succès/),
        })
      );
    });

    it('should update an existing tarif and show success notification', () => {
      const existingTarif = { id: 123, type: 'SOME_TYPE' };
      const editedRow = new Map<number, any>([[1, existingTarif]]);
      apiAdelaideServiceMock.updateTarif.and.returnValue(
        of({
          data: { updateTarif: { type: 'SOME_TYPE' } },
        })
      );

      component.onSaveEdition(editedRow);

      expect(apiAdelaideServiceMock.updateTarif).toHaveBeenCalled();
      expect(notesServiceMock.show).toHaveBeenCalled();
    });

    it('should handle error on create', () => {
      const newTarif = { newRow: true };
      const editedRow = new Map<number, any>([[1, newTarif]]);
      apiAdelaideServiceMock.createTarif.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur test' }] }));

      component.onSaveEdition(editedRow);

      expect(component.asynchronousErrors$.getValue()?.get(1)?.[0].message).toBe('Erreur test');
    });

    it('should handle error on update', () => {
      const existingTarif = { id: 123 };
      const editedRow = new Map<number, any>([[1, existingTarif]]);
      apiAdelaideServiceMock.updateTarif.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur MAJ' }] }));

      component.onSaveEdition(editedRow);

      expect(component.asynchronousErrors$.getValue()?.get(1)?.[0].message).toBe('Erreur MAJ');
    });
  });

  describe('onDeleteRow', () => {
    it('should delete tarifs and show success notification', () => {
      const row = [{ type: 'A', numero: 1 }];
      component.gridApi = {
        applyTransaction: jasmine.createSpy(),
        redrawRows: jasmine.createSpy(),
      } as unknown as GridApi;

      apiAdelaideServiceMock.deleteTarifs.and.returnValue(of({}));

      component.onDeleteRow(row);

      expect(apiAdelaideServiceMock.deleteTarifs).toHaveBeenCalledWith([{ type: 'A', numero: 1 }]);
      expect(notesServiceMock.show).toHaveBeenCalled();
    });

    it('should delete multiple tarifs and show plural success notification', () => {
      const rows = [
        { type: 'A', numero: 1 },
        { type: 'B', numero: 2 },
      ];
      component.gridApi = {
        applyTransaction: jasmine.createSpy(),
        redrawRows: jasmine.createSpy(),
      } as unknown as GridApi;

      apiAdelaideServiceMock.deleteTarifs.and.returnValue(of({}));

      component.onDeleteRow(rows);

      expect(apiAdelaideServiceMock.deleteTarifs).toHaveBeenCalled();
      expect(notesServiceMock.show).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: jasmine.stringMatching(/Les tarifs ont été supprimés avec succès/),
        })
      );
    });

    it('should handle delete error', () => {
      const row = [{ type: 'A', numero: 1 }];
      apiAdelaideServiceMock.deleteTarifs.and.returnValue(throwError({ graphQLErrors: [{ message: 'Erreur suppression' }] }));
      component.gridApi = {
        applyTransaction: jasmine.createSpy(),
        redrawRows: jasmine.createSpy(),
      } as unknown as GridApi;

      component.onDeleteRow(row);

      expect(component.asynchronousErrors$.getValue()?.get(1)?.[0].message).toBe('Erreur suppression');
    });
  });

  describe('agInit', () => {
    it('should initialize with type', () => {
      const params = {
        data: {
          detail: [{ id: 1 }],
          type: 'TYPE_A',
        },
      };

      component.agInit(params as any);

      expect(component.rowData).toEqual([{ id: 1 }]);
      expect(component.type).toBe('TYPE_A');
      expect(tableauBuilderMock.createGridConfiguration).toHaveBeenCalled();
      expect(tableauTarifServiceMock.getDetailColumnDefs).toHaveBeenCalled();
    });

    it('should initialize without type and disable permissions', () => {
      const params = {
        data: {
          detail: [],
          type: null,
        },
      };

      component.agInit(params as any);

      expect(component.canPermPosition).toBe(-1);
    });
  });

  describe('onGridReady', () => {
    it('should set grid API and call getData', () => {
      const params = {
        api: {} as GridApi,
      };
      spyOn(component, 'getData');

      component.onGridReady(params as any);

      expect(component.gridApi).toBeDefined();
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('getData', () => {
    it('should load data when type is defined', () => {
      component.type = 'TYPE_A';

      component.getData();

      expect(apiAdelaideServiceMock.getTarifByType).toHaveBeenCalledWith('TYPE_A');
    });

    it('should set empty rowData when type is not defined', () => {
      component.type = null;

      component.getData();

      expect(component.rowData).toEqual([]);
      expect(apiAdelaideServiceMock.getTarifByType).not.toHaveBeenCalled();
    });
  });

  describe('setError', () => {
    it('should add error to existing errors', () => {
      const errors = new Map<number, any[]>();
      errors.set(1, [{ message: 'Error 1' }]);
      const newError = { message: 'Error 2', isError: true, id: null };

      component.setError(1, newError, errors);

      expect(errors.get(1).length).toBe(2);
      expect(errors.get(1)[1]).toEqual(newError);
    });

    it('should create new error entry if key does not exist', () => {
      const errors = new Map<number, any[]>();
      const newError = { message: 'Error 1', isError: true, id: null };

      component.setError(1, newError, errors);

      expect(errors.get(1).length).toBe(1);
      expect(errors.get(1)[0]).toEqual(newError);
    });
  });

  describe('refresh', () => {
    it('should return false', () => {
      expect(component.refresh()).toBe(false);
    });
  });

  describe('handleGraphQLError', () => {
    it('should handle error without graphQLErrors', () => {
      const error = {};
      const errors = new Map<number, any[]>();

      component['handleGraphQLError'](error, errors);

      expect(errors.get(1)?.[0].message).toBe('Erreur inconnue');
    });
  });

  describe('onSaveEdition with dateFin', () => {
    beforeEach(() => {
      component.gridApi = { forEachNode: jasmine.createSpy(), redrawRows: jasmine.createSpy() } as unknown as GridApi;
      component.type = 'SOME_TYPE';
    });

    it('should create tarif with dateFin', () => {
      const newTarif = { newRow: true, dateDebut: '2024-01-01', dateFin: '2024-12-31' };
      const editedRow = new Map<number, any>([[1, newTarif]]);
      apiAdelaideServiceMock.createTarif.and.returnValue(
        of({
          data: { createTarif: { type: 'SOME_TYPE' } },
        })
      );

      component.onSaveEdition(editedRow);

      expect(apiAdelaideServiceMock.createTarif).toHaveBeenCalled();
    });

    it('should update tarif with dateFin', () => {
      const existingTarif = { id: 123, dateDebut: '2024-01-01', dateFin: '2024-12-31' };
      const editedRow = new Map<number, any>([[1, existingTarif]]);
      apiAdelaideServiceMock.updateTarif.and.returnValue(
        of({
          data: { updateTarif: { type: 'SOME_TYPE' } },
        })
      );

      component.onSaveEdition(editedRow);

      expect(apiAdelaideServiceMock.updateTarif).toHaveBeenCalled();
    });

    it('should handle empty editedRow map', () => {
      const editedRow = new Map<number, any>();

      component.onSaveEdition(editedRow);

      expect(apiAdelaideServiceMock.createTarif).not.toHaveBeenCalled();
      expect(apiAdelaideServiceMock.updateTarif).not.toHaveBeenCalled();
    });
  });
});
