import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { FaqComponent } from './faq.component';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { Faq, FaqStatusType } from '@app/models/faq-conversation';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let mockFaqService: jasmine.SpyObj<ApiAdelaideFaqService>;
  let mockContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;

  const mockPathsResponse = {
    data: {
      getAllPathComplet: [
        { path: '/admin/home', libelle: 'Accueil' },
        { path: '/admin/users', libelle: 'Utilisateurs' }
      ]
    }
  };

  const mockFaqList: Faq[] = [
    {
      id: 1,
      question: 'Question Populaire',
      answer: 'Réponse A',
      path: '/admin/home',
      status: FaqStatusType.ENABLED,
      viewCount: 100,
      exchanges: [],
      createdBy: '',
      updatedBy: '',
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 2,
      question: 'Question Moins Vue',
      answer: 'Réponse B',
      path: '/admin/users',
      status: FaqStatusType.ENABLED,
      viewCount: 5,
      exchanges: [],
      createdBy: '',
      updatedBy: '',
      createdAt: '',
      updatedAt: ''
    }
  ];

  beforeEach(waitForAsync(() => {
    mockFaqService = jasmine.createSpyObj('ApiAdelaideFaqService', ['searchAllFaq', 'increaseViewCount']);
    mockContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', ['getAllPathComplet']);

    TestBed.configureTestingModule({
      declarations: [FaqComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiAdelaideFaqService, useValue: mockFaqService },
        { provide: ApiAdelaideContenuService, useValue: mockContenuService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;

    mockContenuService.getAllPathComplet.and.returnValue(of(mockPathsResponse as any));
    mockFaqService.searchAllFaq.and.returnValue(of({ data: { searchAllFaq: mockFaqList } } as any));
    mockFaqService.increaseViewCount.and.returnValue(of({} as any));
  });

  it('should create', () => {
    component.path = 'ALL';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization Logic', () => {

    it('should select "ALL" if the input path is unknown or undefined', () => {
      component.path = '/chemin/inconnu';

      fixture.detectChanges();

      expect(component.filterForm.get('path')?.value).toBe('ALL');
    });

    it('should select the specific path if it exists in options', () => {
      component.path = '/admin/users';

      fixture.detectChanges();

      expect(component.filterForm.get('path')?.value).toBe('/admin/users');
    });

    it('should load options and initialize form properly', () => {
      component.path = 'ALL';
      fixture.detectChanges();

      expect(mockContenuService.getAllPathComplet).toHaveBeenCalled();
      expect(component.pathOptions.length).toBe(3);
    });
  });

  describe('Filtering Logic', () => {
    beforeEach(() => {
      component.path = 'ALL';
      fixture.detectChanges();
    });

    it('should filter by Path', () => {
      component.filterForm.patchValue({ path: '/admin/users' });

      expect(component.filteredFaqs.length).toBe(1);
      expect(component.filteredFaqs[0].id).toBe(2);
    });

    it('should show ALL when path is "ALL"', () => {
      component.filterForm.patchValue({ path: '/admin/users' });
      expect(component.filteredFaqs.length).toBe(1);

      component.filterForm.patchValue({ path: 'ALL' });
      expect(component.filteredFaqs.length).toBe(2);
    });
  });

  describe('toggleAnswer', () => {
    beforeEach(() => {
      component.path = 'ALL';
      fixture.detectChanges();
    });

    it('should open FAQ and increment viewCount', () => {
      const faqToOpen = component.filteredFaqs[0];
      const initialViews = 100;

      component.toggleAnswer(faqToOpen);

      expect(component.selectedFaqId).toBe(faqToOpen.id);

      expect(faqToOpen.viewCount).toBe(initialViews + 1);

      expect(mockFaqService.increaseViewCount).toHaveBeenCalledWith(faqToOpen.id);
    });

    it('should rollback viewCount on API error', () => {
      const faq = component.filteredFaqs[0];
      const initialViews = faq.viewCount;
      mockFaqService.increaseViewCount.and.returnValue(throwError(() => new Error('Error')));

      component.toggleAnswer(faq);

      expect(faq.viewCount).toBe(initialViews);
    });
  });
});
