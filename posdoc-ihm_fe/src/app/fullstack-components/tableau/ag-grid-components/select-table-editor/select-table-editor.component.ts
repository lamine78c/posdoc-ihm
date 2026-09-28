import { NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-select-table-editor',
  templateUrl: './select-table-editor.component.html',
  standalone: true,
  imports: [NgIf],
  styleUrls: ['./select-table-editor.component.scss'],
})
export class SelectTableEditorComponent implements ICellRendererAngularComp {
  params;
  dropdownVisible = false;
  options = [];
  isHidden = false;
  selectedValue: string;
  isDisabled = false;

  @ViewChild('trigger', { static: false }) triggerRef!: ElementRef;

  agInit(params: ICellRendererParams<any, any>): void {
    this.params = params;
    this.checkIfHidden();
    const ressource = this.params.resource;
    this.isDisabled = !!ressource?.hasProfil;
    if (this.params && this.params.values.length > 0) {
      this.options = this.params.values;
    } else if (this.params.selectData) {
      this.filterData();
    }
  }

  private filterData() {
    this.params.selectData.subscribe(e => {
      if (this.params.filterByFields?.length) {
        this.options = SharedUtil.getUniqueList(
          e.filter(vl =>
            this.params.filterByFields.every(field =>
              field === this.params.acceptGenericOrgs?.key && !!this.params.acceptGenericOrgs
                ? vl[field] === this.params.acceptGenericOrgs.value || vl[field] === this.params.data[field]
                : vl[field] === this.params.data[field]
            )
          ),
          'value'
        );

        // Si pas de données, afficher uniquement la donnée actuelle
        if (this.options.length === 0 && !!this.params.data[this.params.formKey]) {
          this.options = [
            {
              value: this.params.data[this.params.formKey],
              text: this.params.data[this.params.formKey],
              libelle: this.params.data,
            },
          ];
        }
      } else {
        this.options = e;
      }
    });
  }

  refresh(): boolean {
    return false;
  }

  toggleDropdown() {
    if (this.isDisabled || (this.params && this.params.isAllTimeClickable === false)) {
      return;
    }

    if (this.dropdownVisible) {
      this.closeDropdown();
    } else if (this.triggerRef) {
      this.openDropdown();
    }
  }

  openDropdown() {
    const rect = this.triggerRef.nativeElement.getBoundingClientRect();
    const dropdownHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const container = document.createElement('div');
    container.classList.add('table-selector');
    container.id = 'custom-dropdown-table';
    container.style.position = 'absolute';
    container.style.zIndex = '9999';
    container.style.maxHeight = `${dropdownHeight}px`;
    container.style.overflowY = 'auto';

    // Positionnement dynamique
    if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
      // Afficher en dessous
      container.style.top = `${rect.bottom + window.scrollY}px`;
    } else {
      // Afficher au-dessus
      container.style.top = `${rect.top + window.scrollY - dropdownHeight}px`;
    }

    container.style.left = `${rect.left + window.scrollX}px`;

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = this.getTableContent();

    table.addEventListener('click', (event: any) => {
      const row = event.target.closest('tr');
      if (row) {
        const value = row.getAttribute('data-value');
        this.selectValue(value);
      }
    });

    container.appendChild(table);
    document.body.appendChild(container);
    this.dropdownVisible = true;
  }

  private getTableContent(): string {
    let tableContent = `
      <thead>
        <tr>
          <th>Code</th>
          <th>Libellé</th>
        </tr>
      </thead>
    `;
    // Ajouter une ligne vide si hasBlankOption est activé
    if (this.params.hasBlankOption) {
      tableContent += `
      <tr data-value="">
        <td class="empty-option">(Vide)</td>
        <td class="empty-option"></td>
      </tr>`;
    }

    tableContent += this.options
      .map(
        opt => `
      <tr data-value="${opt.value}">
        <td>${opt.value}</td>
        <td>${opt.libelle}</td>
      </tr>
    `
      )
      .join('');
    return tableContent;
  }

  selectValue(value: string) {
    this.selectedValue = value;
    if (this.params.updateValue) {
      this.params.updateValue(value, this.params);
    }
    this.params.setValue?.(value);
    this.closeDropdown();
  }

  closeDropdown() {
    const existing = document.getElementById('custom-dropdown-table');
    if (existing) {
      existing.remove();
    }
    this.dropdownVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.dropdownVisible && !this.triggerRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  private checkIfHidden(): void {
    this.isHidden = !this.params.resource?.exemplaireExists;
  }
}
