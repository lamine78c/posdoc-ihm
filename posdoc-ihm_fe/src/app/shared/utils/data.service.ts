import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private serverData: any;
  private dataTransfer: BehaviorSubject<any> = new BehaviorSubject(null);

  setServerData(data: any): void {
    this.serverData = data;
  }

  getServerData(): any {
    return this.serverData;
  }

  setDataToTransfer(data: any): void {
    this.dataTransfer.next(data);
  }

  getTransferedData(): BehaviorSubject<any> {
    return this.dataTransfer;
  }
}
