import { TestBed } from '@angular/core/testing';
import { ColDef } from 'ag-grid-community';
import { StatusColumnHandlerService } from './status-column-handler.service';

describe('StatusColumnHandlerService', () => {
  let service: StatusColumnHandlerService;
  const columnDefs: ColDef[] = [{ field: 'status' } as ColDef];
  const context = {};
  const config = {
    draftValue: 'draft',
    draftLabel: 'Brouillon',
    enabledValue: 'enabled',
    enabledLabel: 'Activé',
    disabledValue: 'disabled',
    disabledLabel: 'Désactivé',
    allowDraftChanges: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StatusColumnHandlerService] });
    service = TestBed.inject(StatusColumnHandlerService);
  });

  it('should create element html with option Brouillon(selected) and option Acitvé when status is draft and allowDraftChanges is yes', () => {
    const config1 = Object.assign({}, config);
    config1.allowDraftChanges = true;
    service.setupStatusColumnHandler(columnDefs, context, config1);

    expect(Object.keys(columnDefs[0]).includes('cellRenderer')).toBeTruthy();
    const cellRenderer = columnDefs[0].cellRenderer as Function;
    const result = cellRenderer({ data: { status: 'draft' } });

    const container = document.createElement('div');
    container.className = 'd-flex';
    const select = document.createElement('select');
    select.className = 'w-100';

    const draftOption = document.createElement('option');
    draftOption.value = config.draftValue;
    draftOption.text = config.draftLabel;
    draftOption.selected = true;
    draftOption.disabled = true;
    select.appendChild(draftOption);

    const enabledOption = document.createElement('option');
    enabledOption.value = config.enabledValue;
    enabledOption.text = config.enabledLabel;
    select.appendChild(enabledOption);

    container.appendChild(select);

    expect(result).toEqual(container);
  });

  it('should create element html(disabled) with option Brouillon(selected) and option Acitvé when status is draft and allowDraftChanges is no', () => {
    service.setupStatusColumnHandler(columnDefs, context, config);

    expect(Object.keys(columnDefs[0]).includes('cellRenderer')).toBeTruthy();
    const cellRenderer = columnDefs[0].cellRenderer as Function;
    const result = cellRenderer({ data: { status: 'draft' } });

    const container = document.createElement('div');
    container.className = 'd-flex';
    const select = document.createElement('select');
    select.className = 'w-100';

    const draftOption = document.createElement('option');
    draftOption.value = config.draftValue;
    draftOption.text = config.draftLabel;
    draftOption.selected = true;
    draftOption.disabled = true;
    select.appendChild(draftOption);

    const enabledOption = document.createElement('option');
    enabledOption.value = config.enabledValue;
    enabledOption.text = config.enabledLabel;
    select.appendChild(enabledOption);
    select.disabled = true;

    container.appendChild(select);

    expect(result).toEqual(container);
  });

  it('should create element html with option Désactivé and option Acitvé(selected) when status is enabled', () => {
    service.setupStatusColumnHandler(columnDefs, context, config);

    expect(Object.keys(columnDefs[0]).includes('cellRenderer')).toBeTruthy();
    const cellRenderer = columnDefs[0].cellRenderer as Function;
    const result = cellRenderer({ data: { status: 'enabled' } });

    const container = document.createElement('div');
    container.className = 'd-flex';
    const select = document.createElement('select');
    select.className = 'w-100';

    const enabledOption = document.createElement('option');
    enabledOption.value = config.enabledValue;
    enabledOption.text = config.enabledLabel;
    enabledOption.selected = true;
    select.appendChild(enabledOption);

    const disabledOption = document.createElement('option');
    disabledOption.value = config.disabledValue;
    disabledOption.text = config.disabledLabel;
    select.appendChild(disabledOption);

    container.appendChild(select);

    expect(result).toEqual(container);
  });

  it('should create element html with option Désactivé(selected) and option Acitvé when status is disabled', () => {
    service.setupStatusColumnHandler(columnDefs, context, config);

    expect(Object.keys(columnDefs[0]).includes('cellRenderer')).toBeTruthy();
    const cellRenderer = columnDefs[0].cellRenderer as Function;
    const result = cellRenderer({ data: { status: 'disabled' } });

    const container = document.createElement('div');
    container.className = 'd-flex';
    const select = document.createElement('select');
    select.className = 'w-100';

    const enabledOption = document.createElement('option');
    enabledOption.value = config.enabledValue;
    enabledOption.text = config.enabledLabel;
    select.appendChild(enabledOption);

    const disabledOption = document.createElement('option');
    disabledOption.value = config.disabledValue;
    disabledOption.text = config.disabledLabel;
    disabledOption.selected = true;
    select.appendChild(disabledOption);

    container.appendChild(select);

    expect(result).toEqual(container);
  });
});
