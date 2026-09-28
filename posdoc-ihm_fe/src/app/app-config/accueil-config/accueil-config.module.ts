import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AccueilConfigService } from './accueil-config.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [],
  providers: [AccueilConfigService],
})
export class AccueilConfigModule {}
