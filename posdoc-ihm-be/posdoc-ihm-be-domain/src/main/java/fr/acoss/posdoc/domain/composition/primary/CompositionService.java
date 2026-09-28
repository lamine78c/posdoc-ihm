package fr.acoss.posdoc.domain.composition.primary;


import fr.acoss.posdoc.domain.composition.model.Composition;
import fr.acoss.posdoc.domain.composition.secondary.CompositionPersistence;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.imprime.secondary.ImprimePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.client.validators.ClientValidators.*;

public class CompositionService {

  private static final String CLIENT = "Client";
  private static final String COMPOSITION = "Composition";
  private static final String FICHIER = "Fichier";
  private static final String IMPRIMER = "Imprimer";
  private static final String IMPRIMER_FICHIER = "Imprimer et Fichier";

  private final CompositionPersistence compositionPersistence;
  private final ImprimePersistence imprimePersistence;
  private final FichierPersistence fichierPersistence;

  public CompositionService(
          final CompositionPersistence compositionPersistence,
          final ImprimePersistence imprimePersistence,
          final FichierPersistence fichierPersistence
  ) {
    this.compositionPersistence = compositionPersistence;
    this.imprimePersistence = imprimePersistence;
    this.fichierPersistence = fichierPersistence;
  }

  public Composition createComposition(final Composition composition) {

    codeValidator().validate(composition.getCode());
    libelleValidator().validate(composition.getLibelle());

    if (compositionPersistence.exists(composition.getCode())) {
      throw new AlreadyExistingElement(CLIENT, composition.getCode());
    }

    return compositionPersistence.create(composition);
  }

  public Composition updateComposition(final Composition composition) {

    codeValidator().validate(composition.getCode());
    libelleValidator().validate(composition.getLibelle());

    if (!compositionPersistence.exists(composition.getCode())) {
      throw new ElementNotFoundException(COMPOSITION, composition.getCode());
    }

    return compositionPersistence.create(composition);
  }

  public void deleteCompositions(List<String> compositionCodes) {
    // vérification dépendance Imprimer
    List<String> listImp = imprimePersistence.compositionsExistsInImprime(compositionCodes);
    // vérification dépendance Fichier
    List<String> listFich = fichierPersistence.compositionsExistsInFichier(compositionCodes);
    if (!listImp.isEmpty() && !listFich.isEmpty()) {
      throw new StileExistingElement(COMPOSITION, listImp, IMPRIMER_FICHIER);
    } else if (!listImp.isEmpty()) {

      throw new StileExistingElement(COMPOSITION, listImp,  IMPRIMER);
    } else if (!listFich.isEmpty()) {
      
      throw new StileExistingElement(COMPOSITION, listImp,  FICHIER);
    }
    compositionPersistence.deleteAll(compositionCodes);
  }
}
