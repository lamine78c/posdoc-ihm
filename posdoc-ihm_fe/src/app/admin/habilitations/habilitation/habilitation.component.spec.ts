import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HabilitationComponent } from './habilitation.component';

describe('HabilitationComponent', () => {
  let component: HabilitationComponent;
  let fixture: ComponentFixture<HabilitationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HabilitationComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabilitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize rowData with correct structure', () => {
    expect(component.rowData).toEqual([
      { orgHierarchy: ['A'] },
      { orgHierarchy: ['A', 'B'] },
      { orgHierarchy: ['C', 'D'] },
      { orgHierarchy: ['E', 'F', 'G', 'H'] }
    ]);
  });

  it('should initialize columnDefs with groupType field', () => {
    expect(component.columnDefs.length).toBe(1);
    expect(component.columnDefs[0].field).toBe('groupType');
  });

  it('should return "Provided" when params.data exists in valueGetter', () => {
    const params = { data: { orgHierarchy: ['A'] } };
    const result = (component.columnDefs[0].valueGetter as Function)(params);
    expect(result).toBe('Provided');
  });

  it('should return "Filler" when params.data is null in valueGetter', () => {
    const params = { data: null };
    const result = (component.columnDefs[0].valueGetter as Function)(params);
    expect(result).toBe('Filler');
  });

  it('should initialize defaultColDef with flex property', () => {
    expect(component.defaultColDef.flex).toBe(1);
  });

  it('should initialize autoGroupColumnDef with correct header', () => {
    expect(component.autoGroupColumnDef.headerName).toBe('Organisation Hierarchy');
    expect(component.autoGroupColumnDef.cellRendererParams?.suppressCount).toBe(true);
  });

  it('should initialize groupDefaultExpanded to -1', () => {
    expect(component.groupDefaultExpanded).toBe(-1);
  });

  it('should return orgHierarchy in getDataPath', () => {
    const data = { orgHierarchy: ['A', 'B'] };
    expect(component.getDataPath(data)).toEqual(['A', 'B']);
  });
});
