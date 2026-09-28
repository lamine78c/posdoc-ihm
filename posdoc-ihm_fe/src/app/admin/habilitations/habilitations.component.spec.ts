import { LoginService } from '@acoss/prisme-angular-intranet';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ApiAdelaideProfileService } from 'src/app/services/api-adelaide-profile.service';
import { HabilitationsComponent } from './habilitations.component';

describe('HabilitationComponent', () => {
  let component: HabilitationsComponent;
  let fixture: ComponentFixture<HabilitationsComponent>;
  let apiProfileService: jasmine.SpyObj<ApiAdelaideProfileService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let loginService: jasmine.SpyObj<LoginService>;
  let noteService: jasmine.SpyObj<NotesService>;

  const mockHabilitations = {
    data: {
      allHabilitations: [
        { id: 1, identite: 'Habili1', parentId: null, habilitationType: 'MENU', ordre: 1 },
        { id: 2, identite: 'Habili2', parentId: 1, habilitationType: 'MENU', ordre: 2 },
        { id: 3, identite: 'Action1', parentId: 1, habilitationType: 'CONTROLE', ordre: 1 },
        { id: 4, identite: 'Form1', parentId: 1, habilitationType: 'FORMULAIRE', ordre: 1 },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  const mockProfile = {
    data: {
      profile: {
        profile: 'NAT_ADMINISTRATEUR',
        libelleProfile: 'Administrateur',
        habilitations: [
          { id: 1, parentId: null },
          { id: 2, parentId: 1 },
        ],
      },
    },
    loading: false,
    networkStatus: 7,
  };

  const mockProfiles = {
    data: {
      allProfiles: [
        { profile: 'NAT_ADMINISTRATEUR', libelleProfile: 'Administrateur', habilitations: [] },
        { profile: 'NAT_USER', libelleProfile: 'Utilisateur', habilitations: [] },
      ],
    },
    loading: false,
    networkStatus: 7,
  };

  beforeEach(waitForAsync(() => {
    const apiProfileServiceSpy = jasmine.createSpyObj('ApiAdelaideProfileService', [
      'getProfileList',
      'getProfileById',
      'deleteProfile',
      'saveProfile',
      'createProfile',
    ]);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    const loginServiceSpy = jasmine.createSpyObj('LoginService', ['getInfos']);
    const noteServiceSpy = jasmine.createSpyObj('NotesService', ['show']);

    loginServiceSpy.getInfos.and.returnValue({
      infosUtilisateurFront: { hrProfil: 'NAT_ADMINISTRATEUR' },
    });

    TestBed.configureTestingModule({
      declarations: [HabilitationsComponent],
      providers: [
        { provide: ApiAdelaideProfileService, useValue: apiProfileServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: NotesService, useValue: noteServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ habilitations: mockHabilitations }),
          },
        },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    apiProfileService = TestBed.inject(ApiAdelaideProfileService) as jasmine.SpyObj<ApiAdelaideProfileService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    loginService = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    noteService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
  }));

  beforeEach(() => {
    apiProfileService.getProfileList.and.returnValue(of(mockProfiles));
    apiProfileService.getProfileById.and.returnValue(of(mockProfile));

    fixture = TestBed.createComponent(HabilitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the tree without CONTROLE and FORMULAIRE types', () => {
    expect(component.tree.length).toBeGreaterThan(0);
    expect(component.allHabilitations).toEqual(mockHabilitations.data.allHabilitations);
  });

  it('should load the profile list on ngOnInit', () => {
    expect(apiProfileService.getProfileList).toHaveBeenCalled();
    expect(component.profiles).toEqual(mockProfiles.data.allProfiles);
  });

  it('should load the active profile on ngOnInit', () => {
    expect(apiProfileService.getProfileById).toHaveBeenCalledWith('NAT_ADMINISTRATEUR');
    expect(component.profileActive.profile).toBe('NAT_ADMINISTRATEUR');
  });

  it('should change profile when no modifications are in progress', () => {
    component.dataChanged = false;
    component.changeProfile('NAT_USER');

    expect(apiProfileService.getProfileById).toHaveBeenCalledWith('NAT_USER');
  });

  it('should show error when changing profile with unsaved modifications', () => {
    component.dataChanged = true;
    const modalRef = { componentInstance: {} } as any;
    modalService.open.and.returnValue(modalRef);

    component.changeProfile('NAT_USER');

    expect(modalService.open).toHaveBeenCalled();
    expect(apiProfileService.getProfileById).not.toHaveBeenCalledWith('NAT_USER');
  });

  it('should update actions and authorisations when clicking on an habilitation', () => {
    const event = { id: 1 };
    component.habilitationClicked(event);

    expect(component.itemClicked).toEqual(event);
    expect(component.actions.length).toBeGreaterThan(0);
    expect(component.authorisations.length).toBeGreaterThan(0);
  });

  it('should add all habilitations with allVisible', () => {
    component.allVisible();

    const habiliCount = component.currentHabilitations.filter(e => e != null).length;
    expect(habiliCount).toBe(mockHabilitations.data.allHabilitations.length);
  });

  it('should remove all habilitations with allNonVisible', () => {
    component.allNonVisible();

    const habiliCount = component.currentHabilitations.filter(e => e != null).length;
    expect(habiliCount).toBe(0);
    expect(component.actions.every(e => !e.value)).toBeTrue();
    expect(component.authorisations.every(e => !e.value)).toBeTrue();
  });

  it('should save the profile successfully', () => {
    apiProfileService.saveProfile.and.returnValue(of({ data: {}, loading: false, networkStatus: 7 }));
    component.dataChanged = true;
    component.save();

    expect(apiProfileService.saveProfile).toHaveBeenCalled();
    expect(component.dataChanged).toBeFalse();
    expect(noteService.show).toHaveBeenCalled();
  });

  it('should cancel modifications in progress', () => {
    component.dataChanged = true;
    component.itemClicked = { id: 1 };
    component.currentHabilitations = [{ id: 99, parentId: null }];
    component.annuler();

    expect(component.dataChanged).toBeFalse();
    expect(component.initButton).toBeFalse();
  });
});
