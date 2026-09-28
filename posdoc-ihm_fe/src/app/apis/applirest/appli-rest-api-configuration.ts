/* eslint-disable */
import { Injectable } from '@angular/core';

/**
 * Global configuration for AppliRestApi services
 */
@Injectable({
  providedIn: 'root',
})
export class AppliRestApiConfiguration {
  rootUrl: string = '/fullstack_be/v2';
}

export interface AppliRestApiConfigurationInterface {
  rootUrl?: string;
}
