import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { FORM_INDEX_COMBOBOX, FORM_INDEX_TB, FORM_INDEX_TEXT, ZERO } from '../utils/Constants';
import { SessionDataSearchService } from '../utils/session-data-search.service';

@Directive({
  selector: '[sessionDataSearchDirective]',
  standalone: false,
})
export class SessionDataSearchDirective implements AfterViewInit {
  @Input('form') form;
  @Input('index') index;
  @Input('formIndex') formIndex;
  @Input('isLikeRadioBouton') isLikeRadioBouton;

  // event à lancer pour la liste déourlante multiple hierarchisée
  @Output() changeEvent = new EventEmitter<any>();

  // pour le composant "app-liste-deroulante-multiple "
  @Input() set isOptMulInit(value: boolean) {
    value && !!this.formIndex && this.checkListMulti();
  }

  // pour le composant "app-liste-deroulante-hierarchisee"
  @Input() set isOptTreeInit(value: boolean) {
    value && !!this.formIndex && this.checkListMultiH();
  }

  // pour le composant "app-single-select-hierarchise-list"
  @Input() set isOptTreeUniInit(value: boolean) {
    value && !!this.formIndex && this.checkListUniH();
  }

  constructor(
    private sessionDataSearchService: SessionDataSearchService,
    private el: ElementRef
  ) {}

  ngAfterViewInit() {
    const data = this.sessionDataSearchService.getDataSearchFromSession();
    const value = this.sessionDataSearchService.getDataSessionByIndexForm(this.index, data);
    if (!!value && !!this.index) {
      if (FORM_INDEX_TB.includes(this.index)) {
        // pour le composant "app-select-from-table-list" tableau
        this.setTableauElementObservable(this.index, value, this.form);
      } else if (FORM_INDEX_COMBOBOX.includes(this.index)) {
        // pour le composant "app-select-list-with-input" combobox
        this.setComboboxElementObservable(this.index, value, this.form);
      } else if (FORM_INDEX_TEXT.includes(this.index)) {
        this.setTextInputElement(this.index, value, this.form);
      } else {
        // pour le composant "app-liste-deroulante" select
        this.setSelectElementObservable(this.index, value, this.form);
      }
    }
  }

  // liste déroulante multiple
  checkListMulti() {
    const formState = this.form.getRawValue();
    const data = this.sessionDataSearchService.getDataSearchFromSession();
    const dataSet = new Set<string>(data[this.formIndex]);
    let isChange = false;
    for (const opt in formState) {
      if (this.isOptInData(opt, dataSet)) {
        formState[opt] = true;
        isChange = true;
      }
    }
    isChange && this.form.patchValue(formState, { emitEvent: true });
  }

  // liste déroulante multiple hierarchisée
  checkListMultiH() {
    const formState = this.form.getRawValue();
    const selected = [];
    const data = this.sessionDataSearchService.getDataSearchFromSession();
    const dataSet = new Set<string>(data[this.formIndex]);
    let isChange = false;
    for (const elem in formState) {
      for (const opt in formState[elem]) {
        if (this.isOptInData(opt, dataSet)) {
          formState[elem][opt] = true;
          selected.push({ title: opt, selected: true });
          isChange = true;
        }
      }
      // on s'arrête en mode radio (un seul parent sélectionnable à la fois)
      if (this.isLikeRadioBouton && isChange) {
        break;
      }
    }
    // update form
    isChange && this.form.patchValue(formState, { emitEvent: false });
    // lancer changeEvent
    this.changeEvent.emit(selected);
  }

  // liste déroulante hierarchisée
  checkListUniH() {
    const formState = this.form.getRawValue();
    const selected = [];
    let selectedOrg;
    const data = this.sessionDataSearchService.getDataSearchFromSession();
    const dataSet = new Set<string>(data[this.formIndex]);
    for (const elem in formState) {
      for (const opt in formState[elem]) {
        if (this.isOptInData(opt, dataSet)) {
          selected.push({ region: elem, org: opt });
        }
      }
    }
    if (selected.length) {
      // ordonner par region
      selected.sort((a, b) => a.region.localeCompare(b.region));
      // il faut récupérer que la première selection dans l'ordre
      const firstSelected = selected[0];
      selectedOrg = firstSelected.org;
      formState[firstSelected.region][selectedOrg] = true;
      // update form
      this.form.patchValue(formState, { emitEvent: false });
    }
    // lancer changeEvent
    this.changeEvent.emit(selectedOrg);
  }

  isOptInData(opt: string, dataSet: Set<string>): boolean {
    return dataSet.has(opt); // utilise le Set et méthode has() permets de chercher plus rapide
  }

  // observateur select classique
  setSelectElementObservable(idSelect, data, form) {
    const select = this.el.nativeElement.querySelector('select[id="select' + idSelect + '"]') as HTMLSelectElement;
    if (select) {
      const config = { childList: true };
      const callback = function () {
        let isNotFind = true;
        Array.from(select.options).forEach(opt => {
          // data en string ou object adaptable
          if (isNotFind && ((typeof data === 'object' && data.includes(opt.text)) || data === opt.text)) {
            form.patchValue(opt.text, { emitEvent: true });
            isNotFind = false; // ne matche que la 1ère fois
          }
        });
        // observateur déconnecté
        observer.disconnect();
      };
      const observer = new MutationObserver(callback);
      observer.observe(select, config);
    }
  }

  // observateur tableau classique
  setTableauElementObservable(idTable, data, form) {
    const table = this.el.nativeElement.querySelector('table[id="table' + idTable + '"]') as HTMLTableElement;
    if (table) {
      const config = { childList: true, subtree: true };
      const callback = function () {
        // check si only tr vide
        let isTableVide = true;
        Array.from(table.rows).forEach((r: HTMLTableRowElement) => {
          if (r.id) {
            // non table vide si je trouve une ligne avec id défini
            isTableVide = false;
          }
        });
        if (!isTableVide) {
          if (data instanceof Array) {
            const values = Array.from(table.rows)
              .filter((r: HTMLTableRowElement) => data.includes(r.id))
              .map((r: HTMLTableRowElement) => r.id);
            form.patchValue(values, { emitEvent: true });
          } else {
            Array.from(table.rows).forEach((r: HTMLTableRowElement) => r.id === data && form.patchValue(data, { emitEvent: true }));
          }
          // observateur déconnecté
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(table, config);
    }
  }

  setTextInputElement(idInput, data: string | string[], form): void {
    const textInput = this.el.nativeElement.querySelector(`input[id="input${idInput}"]`) as HTMLInputElement;
    if (textInput) {
      let value = '';
      if (data instanceof Array) {
        value = data[0];
      } else {
        value = data;
      }
      form.patchValue(value, { emitEvent: true });
    }
  }

  setComboboxElementObservable(idInput, data: string | string[], form): void {
    const textInput = this.el.nativeElement.querySelector(`input[id="input${idInput}"]`) as HTMLInputElement;
    const combobox = this.el.nativeElement.querySelector(`div[id="combobox-options${idInput}"]`) as HTMLDivElement;
    if (combobox && textInput) {
      const config = { childList: true };
      const callback = function () {
        if (combobox.childElementCount > ZERO) {
          let value = '';
          if (data instanceof Array) {
            value = data[0];
          } else {
            value = data;
          }
          form.patchValue(value, { emitEvent: true });
          // observateur déconnecté
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(combobox, config);
    }
  }
}
