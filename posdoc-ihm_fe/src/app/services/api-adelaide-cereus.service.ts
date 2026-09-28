import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideCereusService {
  constructor(private apollo: Apollo) {}

  public getAllProductionFlux() {
    return this.apollo.watchQuery({
      query: gql`
        query GetAllProductionFlux {
          allProductionFlux {
            id
            nomArchiveRetour
            nomFichierRetour
            dateProduction
            datePoste
            nombrePlisFabriques
            details
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }

  public deleteProductionFlux(ids: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation delete($ids: [String]!) {
          deleteProductionFlux(deleteProductionFlux: { ids: $ids }) {
            ok
          }
        }
      `,
      variables: {
        ids: ids,
      },
      fetchPolicy: 'no-cache',
    });
  }

  getAllProductionFluxMock() {
    return of({ data: { allProductionFlux: data } });
  }
}

const data = [
  {
    id: '1',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '2',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '3',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '4',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '5',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '6',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '7',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '8',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '9',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
  {
    id: '19',
    archiveRetour: 'nom archive retours',
    dateProduction: '19/12/2023',
    datePoste: '19/12/2023',
    fichierRetour: 'nom fichier retour',
    plisFabriques: '10',
  },
];
