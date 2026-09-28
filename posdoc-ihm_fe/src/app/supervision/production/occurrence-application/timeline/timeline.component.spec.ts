/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';
import { TimelineOccAppMenuService } from '../service/timeline-occ-app-menu.service';
import { MenuTimeLineOccAppInterface } from '../model/timeline-menu';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let timelineOccAppMenuServiceSpy: jasmine.SpyObj<TimelineOccAppMenuService>;

  const dataInput = [
    {
      codEnv: 'P',
      codOrg: '00T',
      codApp: 'MAS',
      perCod: '250821-00',
      appsta: 'D',
      dapplc: '2025-10-09T14:58:42',
      dappld: '2025-10-09T14:58:43',
      dapplt: null,
      codSit: 'CIRSO',
      groupId: '0-P00TMAS250821-00CIRSO',
    },
    {
      codEnv: 'P',
      codOrg: '00T',
      codApp: 'MAS',
      perCod: '250826-00',
      appsta: 'T',
      dapplc: '2025-10-09T14:58:42',
      dappld: '2025-10-09T14:58:43',
      dapplt: '2025-10-09T14:58:54',
      codSit: 'CIRSO',
      groupId: '1-P00TMAS250826-00CIRSO',
    },
    {
      codEnv: 'P',
      codOrg: '00T',
      codApp: 'MAS',
      perCod: '250827-00',
      appsta: 'S',
      dapplc: '2025-10-09T14:58:41',
      dappld: '2025-10-09T14:58:41',
      dapplt: null,
      codSit: 'CIRSO',
      groupId: '2-P00TMAS250827-00CIRSO',
    },
    {
      codEnv: 'P',
      codOrg: '00T',
      codApp: 'MAS',
      perCod: '250828-00',
      appsta: 'C',
      dapplc: null,
      dappld: null,
      dapplt: null,
      codSit: 'CIRSO',
      groupId: '3-P00TMAS250828-00CIRSO',
    },
  ];

  beforeEach(waitForAsync(() => {
    timelineOccAppMenuServiceSpy = jasmine.createSpyObj('TimelineOccAppMenuService', ['openPopupDetails', 'onMenuOptionClick']);
    TestBed.configureTestingModule({
      declarations: [TimelineComponent],
      providers: [{ provide: TimelineOccAppMenuService, useValue: timelineOccAppMenuServiceSpy }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    component.dataInput = dataInput;
    component.isIntervalStart = false;
    component.dateDebut = new Date('2026-06-29');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should upate the number of rows', () => {
    component.ngOnChanges();
    expect(component.isIntervalStart).toBeFalsy();
    expect(component.nbrDataCree).toBe(1);
    expect(component.nbrDataDebute).toBe(1);
    expect(component.nbrDataSuspendu).toBe(1);
    expect(component.nbrDataTermine).toBe(1);
    expect(component.dataTimeLine.length).toBe(4);
  });

  it('should only show the status C when toShowStatusCree is true', () => {
    component.filterDataByStatusCree();
    expect(component.dataTimeLine.length).toBe(1);
  });

  it('should only show the status D when toShowStatusDebute is true', () => {
    component.filterDataByStatusDebute();
    expect(component.dataTimeLine.length).toBe(1);
  });

  it('should only show the status T when toShowStatusTermine is true', () => {
    component.filterDataByStatusTermine();
    expect(component.dataTimeLine.length).toBe(1);
  });

  it('should only show the status S when toShowStatusSuspendu is true', () => {
    component.filterDataByStatusSuspendu();
    expect(component.dataTimeLine.length).toBe(1);
  });

  it('should handle right click on contextmenu', () => {
    const onSpy = jasmine.createSpy('on');
    component.timeline = undefined;
    spyOn<any>(component, 'createTimeline').and.returnValue({
      on: onSpy,
      setData: jasmine.createSpy('setData'),
      setOptions: jasmine.createSpy('setOptions'),
    } as any);
    spyOn(component as any, 'getItemByProperties').and.returnValue('item1');
    spyOn(component as any, 'showContextMenu');
    component.updateTimeline();
    const contextMenuCallback = onSpy.calls.allArgs().find(args => args[0] === 'contextmenu')?.[1];
    const preventDefaultSpy = jasmine.createSpy('preventDefault');
    const mockProperties = {
      event: {
        preventDefault: preventDefaultSpy,
      },
    };
    contextMenuCallback(mockProperties);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component['getItemByProperties']).toHaveBeenCalledWith(mockProperties);
    expect(component['showContextMenu']).toHaveBeenCalled();
  });

  it('should handle left click on click', () => {
    const onSpy = jasmine.createSpy('on');
    component.timeline = undefined;
    spyOn<any>(component, 'createTimeline').and.returnValue({
      on: onSpy,
      setData: jasmine.createSpy('setData'),
      setOptions: jasmine.createSpy('setOptions'),
      itemsData: {
        get: jasmine.createSpy('get').and.returnValue(dataInput),
      },
    } as any);
    spyOn(component as any, 'getItemByProperties').and.returnValue('item1');
    component.updateTimeline();
    const clickCallback = onSpy.calls.allArgs().find(args => args[0] === 'click')?.[1];
    const mockProperties = {};
    clickCallback(mockProperties);
    expect(component['getItemByProperties']).toHaveBeenCalledWith(mockProperties);
    expect(timelineOccAppMenuServiceSpy.openPopupDetails).toHaveBeenCalledWith(dataInput);
  });

  it('isStatusSuspenduEnabled validity', () => {
    component.nbrDataSuspendu = 1;
    component.isIntervalStart = false;
    expect(component.isStatusSuspenduEnabled()).toBeTruthy();
    component.nbrDataSuspendu = 1;
    component.isIntervalStart = true;
    expect(component.isStatusSuspenduEnabled()).toBeFalsy();
    component.nbrDataSuspendu = 0;
    component.isIntervalStart = false;
    expect(component.isStatusSuspenduEnabled()).toBeFalsy();
  });

  it('isStatusCreeEnabled validity', () => {
    component.nbrDataCree = 1;
    component.isIntervalStart = false;
    expect(component.isStatusCreeEnabled()).toBeTruthy();
    component.nbrDataCree = 1;
    component.isIntervalStart = true;
    expect(component.isStatusCreeEnabled()).toBeFalsy();
    component.nbrDataCree = 0;
    component.isIntervalStart = false;
    expect(component.isStatusCreeEnabled()).toBeFalsy();
  });

  it('isStatusDebuteEnabled validity', () => {
    component.nbrDataDebute = 1;
    component.isIntervalStart = false;
    expect(component.isStatusDebuteEnabled()).toBeTruthy();
    component.nbrDataDebute = 1;
    component.isIntervalStart = true;
    expect(component.isStatusDebuteEnabled()).toBeFalsy();
    component.nbrDataDebute = 0;
    component.isIntervalStart = false;
    expect(component.isStatusDebuteEnabled()).toBeFalsy();
  });

  it('isStatusTermineEnabled validity', () => {
    component.nbrDataTermine = 1;
    component.isIntervalStart = false;
    expect(component.isStatusTermineEnabled()).toBeTruthy();
    component.nbrDataTermine = 1;
    component.isIntervalStart = true;
    expect(component.isStatusTermineEnabled()).toBeFalsy();
    component.nbrDataTermine = 0;
    component.isIntervalStart = false;
    expect(component.isStatusTermineEnabled()).toBeFalsy();
  });

  it('onMenuOptionClick validity', () => {
    const onSpy = jasmine.createSpy('on');
    component.timeline = undefined;
    spyOn<any>(component, 'createTimeline').and.returnValue({
      on: onSpy,
      itemsData: {
        get: jasmine.createSpy('get').and.returnValue(dataInput),
      },
    } as any);
    spyOn(component as any, 'getItemByProperties').and.returnValue('item1');
    component.updateTimeline();
    const option: MenuTimeLineOccAppInterface = {
      value: 'Billing',
      label: 'Facturation',
      action: 'openBilling',
      param: {
        path: '/exploitation-editique/consolidation-facturation',
      },
    };
    component.onMenuOptionClick(option);
    expect(timelineOccAppMenuServiceSpy.onMenuOptionClick).toHaveBeenCalledWith(option, dataInput, component.applySearchEvent);
  });
});
