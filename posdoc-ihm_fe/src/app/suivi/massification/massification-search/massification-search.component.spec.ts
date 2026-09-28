import { MassificationSearchComponent } from './massification-search.component';
import { ApiAdelaideSuiviMassificationService } from '@app/services/api-adelaide-suivi-massification.service';
import { of } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SessionDataSearchService } from '@app/shared/utils/session-data-search.service';

describe('MassificationSearchComponent', () => {
  let component: MassificationSearchComponent;
  let apiAdelaideSuiviMassificationService: jasmine.SpyObj<ApiAdelaideSuiviMassificationService>;
  let sessionDataSearchService: jasmine.SpyObj<SessionDataSearchService>;
  let fb: FormBuilder;

  const createOption = (value: string) => ({
    value,
    columns: [
      { label: 'Période', value },
      { label: 'Statut', value: '' },
      { label: 'Debuté', value: '' },
      { label: 'Terminé', value: '' },
    ],
  });

  beforeEach(() => {
    apiAdelaideSuiviMassificationService = jasmine.createSpyObj('ApiAdelaideSuiviMassificationService', ['getFiltreMassification']);
    sessionDataSearchService = jasmine.createSpyObj('SessionDataSearchService', ['updateDataSearchToSession']);
    fb = new FormBuilder();

    component = new MassificationSearchComponent(apiAdelaideSuiviMassificationService, fb, sessionDataSearchService);

    component.form = fb.group({
      environnement: ['', null],
      site: fb.group({}),
      periode: ['', null],
      periodeFin: [''],
    });
    component.formEnv = component.form.get('environnement') as FormControl;
    component.formPeriodeDebut = component.form.get('periode') as FormGroup;

    component.optionsPeriode = [createOption('240101-00'), createOption('260901-00'), createOption('260920-00'), createOption('260921-00')];
    component.optionsPeriodeDebut = component.optionsPeriode;
    component.optionsPeriodeFin = component.optionsPeriode;

    (component as any).onPeriodeDebutChange();
    (component as any).onPeriodeFinChange();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate results on succesful API call', () => {
    const mockResponse: { data: { getDistinctFiltreMassification: any[] } } = {
      data: {
        getDistinctFiltreMassification: [
          {
            masenv: 'T',
            masorg: '00L',
            masper: '241023-00',
          },
        ],
      },
    };
    apiAdelaideSuiviMassificationService.getFiltreMassification.and.returnValue(of(mockResponse as any));
    component.getFiltreMassification();
    expect(apiAdelaideSuiviMassificationService.getFiltreMassification).toHaveBeenCalled();
    expect(component.searchData.length).toBeGreaterThan(0);
  });

  it('should allow empty periodeFin when periodeDebut is within 15 days', () => {
    const today = new Date();
    const annee = String(today.getFullYear()).substring(2);
    const mois = String(today.getMonth() + 1).padStart(2, '0');
    const jour = String(today.getDate()).padStart(2, '0');
    const periodeDebut = `${annee}${mois}${jour}-00`;

    component.optionsPeriode = [createOption(periodeDebut)];
    component.optionsPeriodeDebut = component.optionsPeriode;
    component.optionsPeriodeFin = component.optionsPeriode;

    component.form.get('environnement').setValue('T');
    component.form.get('periode').setValue(periodeDebut);
    component.form.get('periodeFin').setValue('');

    expect(component.isFormValid()).toBe(true);
  });

  it('should reject empty periodeFin when periodeDebut is older than 15 days', () => {
    component.form.get('environnement').setValue('T');
    component.form.get('periode').setValue('240101-00');
    component.form.get('periodeFin').setValue('');

    expect(component.isFormValid()).toBe(false);
  });

  it('should emit data when periodeFin is provided', () => {
    component.form.get('environnement').setValue('T');
    component.form.get('periode').setValue('260901-00');
    component.form.get('periodeFin').setValue('260920-00');

    let emitted: any;
    component.applySearchEvent.subscribe(data => (emitted = data));

    component.valider();

    expect(sessionDataSearchService.updateDataSearchToSession).toHaveBeenCalled();
    expect(emitted).toBeTruthy();
  });

  it('should set error on periodeFin when periodeDebut is older than 15 days and periodeFin is empty', () => {
    component.form.get('environnement').setValue('T');
    component.form.get('periode').setValue('240101-00');
    component.form.get('periodeFin').setValue('');

    component.valider();

    expect(sessionDataSearchService.updateDataSearchToSession).not.toHaveBeenCalled();
    expect(component.form.get('periodeFin').errors).not.toBeNull();
  });

  it('should clear error when periodeFin is set after validation failure', () => {
    component.form.get('environnement').setValue('T');
    component.form.get('periode').setValue('240101-00');
    component.form.get('periodeFin').setValue('');

    component.valider();
    expect(component.form.get('periodeFin').errors).not.toBeNull();

    component.form.get('periodeFin').setValue('260920-00');
    expect(component.form.get('periodeFin').errors).toBeNull();
  });

  it('should clear error when periodeDebut changes', () => {
    component.form.get('environnement').setValue('T');
    component.form.get('periode').setValue('240101-00');
    component.form.get('periodeFin').setValue('');

    component.valider();
    expect(component.form.get('periodeFin').errors).not.toBeNull();

    const today = new Date();
    const annee = String(today.getFullYear()).substring(2);
    const mois = String(today.getMonth() + 1).padStart(2, '0');
    const jour = String(today.getDate()).padStart(2, '0');
    const newPeriode = `${annee}${mois}${jour}-00`;
    component.optionsPeriode = [createOption(newPeriode)];
    component.optionsPeriodeDebut = component.optionsPeriode;
    component.optionsPeriodeFin = component.optionsPeriode;
    component.form.get('periode').setValue(newPeriode);
    expect(component.form.get('periodeFin').errors).toBeNull();
  });
});
