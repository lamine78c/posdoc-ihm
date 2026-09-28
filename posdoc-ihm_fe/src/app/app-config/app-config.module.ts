import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './app-config.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [],
  providers: [AppConfigService],
})
export class AppConfigModule {}
