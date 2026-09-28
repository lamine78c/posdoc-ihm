import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DetailsParamDistrComponent } from './details-param-distr.component';

describe('DetailsParamDistrComponent', () => {
  let component: DetailsParamDistrComponent;
  let fixture: ComponentFixture<DetailsParamDistrComponent>;
  let mockParams: any;
  let mockApi: any;
  let mockNode: any;
  let mockParentNode: any;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('api', ['addEventListener', 'removeEventListener']);
    mockParentNode = {
      __objectId: 'test-id',
      updated: false,
      formErrors: new Map()
    };
    mockNode = {
      parent: mockParentNode
    };

    mockParams = {
      api: mockApi,
      node: mockNode,
      rowIdEdit: 'test-id',
      data: {
        commandeDistribution: 'TEST_COMMAND'
      }
    };

    await TestBed.configureTestingModule({
      declarations: [DetailsParamDistrComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsParamDistrComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (component && component.ngOnDestroy) {
      component.ngOnDestroy();
    }
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    component.agInit(mockParams);
    expect(component).toBeTruthy();
  });

  describe('agInit', () => {
    it('should initialize component in editing mode when rowIdEdit matches node id', () => {
      component.agInit(mockParams);

      expect(component.isEditing).toBe(true);
      expect(component.params).toBe(mockParams);
      expect(component.form).toBeDefined();
      expect(component.form.get('commandeDistribution').value).toBe('TEST_COMMAND');
      expect(component.form.get('commandeDistribution').disabled).toBe(false);
    });

    it('should initialize component in read-only mode when rowIdEdit does not match', () => {
      mockParams.rowIdEdit = 'different-id';

      component.agInit(mockParams);

      expect(component.isEditing).toBe(false);
      expect(component.form.get('commandeDistribution').disabled).toBe(true);
    });

    it('should register event listener on api', () => {
      component.agInit(mockParams);

      expect(mockApi.addEventListener).toHaveBeenCalledWith('rowDataUpdated', jasmine.any(Function));
    });

    it('should update parent node data when form value changes', (done) => {
      component.agInit(mockParams);

      setTimeout(() => {
        component.form.get('commandeDistribution').setValue('NEW_COMMAND');

        setTimeout(() => {
          expect(mockParams.data.commandeDistribution).toBe('NEW_COMMAND');
          expect(mockParentNode.updated).toBe(true);
          done();
        }, 350);
      }, 10);
    });

    it('should set form errors in parent node when form becomes invalid', (done) => {
      component.agInit(mockParams);

      setTimeout(() => {
        component.form.get('commandeDistribution').setValue('');

        setTimeout(() => {
          expect(mockParentNode.formErrors.get('detailsForm')).toBe(true);
          done();
        }, 350);
      }, 10);
    });

    it('should mark form as touched when in editing mode and form errors exist', () => {
      mockParentNode.formErrors.set('detailsForm', true);

      component.agInit(mockParams);

      const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched');

      component.displayErrors();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });

    it('should set initial form errors when in editing mode and no existing errors', () => {
      mockParentNode.formErrors.clear();

      component.agInit(mockParams);

      expect(mockParentNode.formErrors.has('detailsForm')).toBe(true);
      expect(mockParentNode.formErrors.get('detailsForm')).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should return false', () => {
      component.agInit(mockParams);

      const result = component.refresh(mockParams);
      expect(result).toBe(false);
    });
  });

  describe('displayErrors', () => {
    it('should mark all form fields as touched', () => {
      component.agInit(mockParams);
      const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched');

      component.displayErrors();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions and remove event listeners', () => {
      const mockSubscription = jasmine.createSpyObj('subscription', ['unsubscribe']);
      component.subscriptions = [mockSubscription];

      component.agInit(mockParams);

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockApi.removeEventListener).toHaveBeenCalledWith('cellEditingStarted', jasmine.any(Function));
    });

    it('should handle empty subscriptions array', () => {
      component.subscriptions = [];
      component.agInit(mockParams);

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
