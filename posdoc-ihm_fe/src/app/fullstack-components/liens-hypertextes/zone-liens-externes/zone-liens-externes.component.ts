import { Component, Input, OnInit } from '@angular/core';
import { ZoneLienExternes } from '@app/fullstack-components/zone-information/models/zone-information.models';

@Component({
  selector: 'app-zone-liens-externes',
  templateUrl: './zone-liens-externes.component.html',
  standalone: false,
})
export class ZoneLiensExternesComponent implements OnInit {
  /**
   * Liens à afficher
   */
  @Input() links: ZoneLienExternes[];
  /**
   * Nombre de colonnes voulues
   */
  @Input() columns: number;

  linksInChunks: ZoneLienExternes[][];

  ngOnInit(): void {
    this.linksInChunks = this.cutArrayInChunks(this.links, this.columns);
  }

  /**
   * Découpe le tableau en liens en chunks pour un affichage par colonnes
   */
  cutArrayInChunks(inputArray: ZoneLienExternes[], columns: number): ZoneLienExternes[][] {
    const perChunk = Math.ceil(inputArray.length / columns);

    return inputArray.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, []);
  }
}
