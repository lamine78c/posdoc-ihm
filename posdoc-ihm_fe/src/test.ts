// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// Mock quill-image-resize-module before any imports
import { NO_ERRORS_SCHEMA } from '@angular/core';

(window as any).Quill = (window as any).Quill || {
  imports: {
    parchment: {
      Style: class MockStyle {},
      Attributor: {
        Style: class MockAttributorStyle {}
      }
    }
  },
  register: () => {}
};

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

const originConfig = getTestBed().configureTestingModule;
getTestBed().configureTestingModule = (moduleDef) => {
  if (!moduleDef.schemas) {
    moduleDef.schemas = [];
  }
  moduleDef.schemas.push(NO_ERRORS_SCHEMA);
  return originConfig.apply(getTestBed(), [moduleDef]);
};
