import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AccueilMessagesComponent } from './accueil-messages/accueil-messages.component';
import { SharedModule } from "@app/shared/shared.module";

const routes: Routes = [
  {
    path: '',
    component: AccueilMessagesComponent
  }
]

@NgModule({
  declarations: [AccueilMessagesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
],
})
export class AccueilModule { }
