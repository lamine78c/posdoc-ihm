import { Component, OnInit } from '@angular/core';
import { Organisme } from '@app/models/organisme';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
//TODO voir si on peut supprimer le composant home
export class HomeComponent implements OnInit {
  organismes: Organisme[];
  loading = true;
  error: any;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    // do nothing
  }
}
