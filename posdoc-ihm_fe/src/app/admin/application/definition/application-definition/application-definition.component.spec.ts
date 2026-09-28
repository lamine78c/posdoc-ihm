import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApplicationDefinitionComponent, DeleteApplicationInput } from './application-definition.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideApplicationService } from '@app/services/api-adelaide-application.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { TableauApplicationDefinitionService } from './service/tableau-application-definition.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AddType } from '@app/models/enums/add-type';
import SharedUtil from '@app/shared/utils/SharedUtil';

describe('ApplicationDefinitionComponent', () => {
  let component: ApplicationDefinitionComponent;
  let fixture: ComponentFixture<ApplicationDefinitionComponent>;

  let mockNotesService: jasmine.SpyObj<NotesService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockApiAdelaideApplicationService: jasmine.SpyObj<ApiAdelaideApplicationService>;
  let mockGenerateFileService: jasmine.SpyObj<GenerateFileService>;
  let mockTableauApplicationDefinitionService: jasmine.SpyObj<TableauApplicationDefinitionService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockApplicationsData = {
    data: {
      allApplications: [
        {
          code: 'SNV2',
          libelle: 'SNV2',
          codeOrganisation: '117',
          codeEnvironnement: 'P',
          codeSystem: 'SYS001'
        },
        {
          code: 'PAJE',
          libelle: 'PAJE',
          codeOrganisation: '771',
          codeEnvironnement: 'P',
          codeSystem: 'SYS002'
        }
      ],
      allOrganismes: [
        { code: '117', libelle: 'Organisme 1', codeRegion: '117' },
        { code: '771', libelle: 'Organisme 2', codeRegion: '117' }
      ]
    }
  };

  const mockConfigData = {
    data: {
      allEnvironnements: [
        { code: 'P' },
        { code: 'T' },
        { code: 'I' }
      ]
    }
  };

  const mockGridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true
  };

  const mockColumnDefs = [
    { field: 'codeEnvironnement', headerName: 'Environnement', cellRendererParams: { selectData: null }, floatingFilterComponentParams: {} },
    { field: 'codeOrganisation', headerName: 'Organisation', cellRendererParams: { selectData: null }, floatingFilterComponentParams: { selectData: null } },
    { field: 'code', headerName: 'Code', cellRendererParams: { selectData: null } },
    { field: 'libelle', headerName: 'Libellé' }
  ];

  beforeEach(async () => {
    mockNotesService = jasmine.createSpyObj('NotesService', ['show']);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockApiAdelaideApplicationService = jasmine.createSpyObj('ApiAdelaideApplicationService', [
      'getAllApplications',
      'getConfigData',
      'createApplication',
      'updateApplication',
      'deleteApplications'
    ]);
    mockGenerateFileService = jasmine.createSpyObj('GenerateFileService', ['generatePDFFile', 'generateExcelFile']);
    mockTableauApplicationDefinitionService = jasmine.createSpyObj('TableauApplicationDefinitionService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate'
    ]);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasActionDeMasse']);

    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue(mockGridOptions as any);
    mockTableauApplicationDefinitionService.getColumnDefs.and.returnValue(mockColumnDefs);
    mockTableauApplicationDefinitionService.getOverlayNoRowsTemplate.and.returnValue('<span>Aucune donnée disponible</span>');
    mockApiAdelaideApplicationService.getAllApplications.and.returnValue(of(mockApplicationsData as any));
    mockApiAdelaideApplicationService.getConfigData.and.returnValue(of(mockConfigData as any));
    mockPermissionService.hasActionDeMasse.and.returnValue(true);

    spyOn(SharedUtil, 'getCodeRegionByCodeOrg').and.returnValue('117');
    spyOn(SharedUtil, 'getNumberTotalRows').and.returnValue(2);

    await TestBed.configureTestingModule({
      declarations: [ApplicationDefinitionComponent],
      providers: [
        { provide: NotesService, useValue: mockNotesService },
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: ApiAdelaideApplicationService, useValue: mockApiAdelaideApplicationService },
        { provide: GenerateFileService, useValue: mockGenerateFileService },
        { provide: TableauApplicationDefinitionService, useValue: mockTableauApplicationDefinitionService },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDefinitionComponent);
    component = fixture.componentInstance;
  });

  describe('onSaveEdition', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.gridApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
      component.organismes = mockApplicationsData.data.allOrganismes;
    });

    it('should create new application successfully', () => {
      const newApplication = {
        code: 'SNV3',
        libelle: 'Nouvelle Application',
        codeOrganisation: '117',
        codeEnvironnement: 'P',
        codeSystem: 'SYS003',
        newRow: true
      };

      const editedRow = new Map();
      editedRow.set(1, newApplication);

      const mockCreateResponse = {
        data: {
          createApplication: {
            code: 'SNV3',
            codeEnvironnement: 'P',
            codeOrganisation: '117'
          }
        }
      };

      mockApiAdelaideApplicationService.createApplication.and.returnValue(of(mockCreateResponse));

      component.onSaveEdition(editedRow);

      expect(mockApiAdelaideApplicationService.createApplication).toHaveBeenCalledWith(
        jasmine.objectContaining({
          code: 'SNV3',
          libelle: 'Nouvelle Application',
          codeOrganisation: '117',
          codeEnvironnement: 'P',
          codeSystem: 'SYS003',
          codeGroupe: null,
          lotNumber: null,
          typeRefection: 'INITIAUX'
        })
      );

      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'L\'application "P-117-SNV3" a été ajoutée avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
    });

    it('should update existing application successfully', () => {
      const existingApplication = {
        code: 'SNV2',
        libelle: 'Application Modifiée',
        codeOrganisation: '117',
        codeEnvironnement: 'P',
        codeSystem: 'SYS001'
      };

      const editedRow = new Map();
      editedRow.set(1, existingApplication);

      const mockUpdateResponse = { data: { updateApplication: existingApplication } };
      mockApiAdelaideApplicationService.updateApplication.and.returnValue(of(mockUpdateResponse));

      component.onSaveEdition(editedRow);

      expect(mockApiAdelaideApplicationService.updateApplication).toHaveBeenCalledWith(
        jasmine.objectContaining({
          code: 'SNV2',
          libelle: 'Application Modifiée',
          codeOrganisation: '117',
          codeEnvironnement: 'P',
          codeSystem: 'SYS001',
          codeGroupe: null,
          lotNumber: null,
          typeRefection: 'INITIAUX'
        })
      );

      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'L\'application "P-117-SNV2" a été mise à jour',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
    });
  });

  describe('onDeleteRow', () => {
    beforeEach(() => {
      component.gridApi = jasmine.createSpyObj('GridApi', ['applyTransaction', 'redrawRows']);
    });

    it('should delete single application successfully', () => {
      const applicationsToDelete = [{
        code: 'SNV2',
        codeOrganisation: '117',
        codeEnvironnement: 'P'
      }];

      const mockDeleteResponse = { data: { deleteApplications: true } };
      mockApiAdelaideApplicationService.deleteApplications.and.returnValue(of(mockDeleteResponse));

      component.onDeleteRow(applicationsToDelete);

      expect(mockApiAdelaideApplicationService.deleteApplications).toHaveBeenCalledWith([
        jasmine.objectContaining({
          code: 'SNV2',
          codeOrganisation: '117',
          codeEnvironnement: 'P'
        })
      ]);

      expect(component.gridApi.applyTransaction).toHaveBeenCalledWith({ remove: applicationsToDelete });
      expect(component.gridApi.redrawRows).toHaveBeenCalled();
      expect(mockNotesService.show).toHaveBeenCalledWith({
        title: 'L\'application a été supprimée avec succès',
        classname: 'note-confirmation',
        category: ToastCategoryEnum.SUCCESS
      });
    });
  });

  describe('DeleteApplicationInput', () => {
    it('should create DeleteApplicationInput instance', () => {
      const deleteInput = new DeleteApplicationInput();
      deleteInput.codeEnvironnement = 'P';
      deleteInput.codeOrganisation = '117';
      deleteInput.code = 'SNV2';

      expect(deleteInput.codeEnvironnement).toBe('P');
      expect(deleteInput.codeOrganisation).toBe('117');
      expect(deleteInput.code).toBe('SNV2');
    });
  });
});
