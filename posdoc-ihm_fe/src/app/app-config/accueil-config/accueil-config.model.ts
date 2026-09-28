export interface IAppConfigAccueil {
  documentations: {
    projets: [];
  };
  liens: {
    blocs: [
      {
        titre: string;
        liens: [
          {
            icone: string;
            lien: string;
            nomlien: string;
            description: string;
          },
        ];
      },
    ];
  };
}
