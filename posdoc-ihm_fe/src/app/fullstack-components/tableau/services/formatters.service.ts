import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormattersService {
  constructor() {
    // do nothing
  }

  toUpperCase(value: string, input): any {
    if (!value) {
      return '';
    }
    const pos = input?.selectionStart;
    let res = value.toUpperCase();
    return { value: res, cursorPos: pos };
  }

  toLowerCase(value: string, input): any {
    if (!value) {
      return '';
    }
    const pos = input?.selectionStart;
    let res = value.toLowerCase();
    return { value: res, cursorPos: pos };
  }

  extractKeys(mappings: Record<string, string>) {
    return Object.keys(mappings);
  }

  extractValues(mappings: Record<string, string>) {
    return Object.values(mappings);
  }

  lookupValue(mappings: Record<string, string>, key: string) {
    return mappings[key];
  }

  lookupKey(mappings: Record<string, string>, name: string) {
    const keys = Object.keys(mappings);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (mappings[key] === name) {
        return key;
      }
    }
  }
}
