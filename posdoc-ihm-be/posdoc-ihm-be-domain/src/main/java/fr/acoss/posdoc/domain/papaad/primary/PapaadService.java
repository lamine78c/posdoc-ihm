package fr.acoss.posdoc.domain.papaad.primary;

import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import fr.acoss.posdoc.domain.papaad.model.Papaad;
import fr.acoss.posdoc.domain.papaad.model.PapaadCompositeId;
import fr.acoss.posdoc.domain.papaad.secondary.PapaadPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.util.List;

public class PapaadService {

  public static final String PAPAAD = "Papaad";
  private final PapaadPersistence papaadPersistence;
  private final CommandePersistence commandePersistence;


  public PapaadService(final PapaadPersistence papaadPersistence, final CommandePersistence commandePersistence) {
    this.papaadPersistence = papaadPersistence;
    this.commandePersistence = commandePersistence;
  }

  public Papaad createPapaad(final Papaad papaad) {
    verify(papaad);
    if (papaadPersistence.exists(papaad.getCodeCommande(), papaad.getCodeFichier(), papaad.getCodeNotif())) {
      throw new AlreadyExistingElement(PAPAAD, papaad.getCodeCommande() + ' ' + papaad.getCodeFichier() + ' ' + papaad.getCodeNotif());
    }
    return papaadPersistence.create(papaad);
  }

  public Papaad updatePapaad(final Papaad papaad) {

    return papaadPersistence.update(papaad);
  }

  public void deletePapaads(List<PapaadCompositeId> ids) {
    papaadPersistence.deleteAll(ids);
  }

  private void verify(Papaad papaad) {

    if (!commandePersistence.existsByCode(papaad.getCodeCommande())) {
      throw new ElementNotFoundException(PAPAAD, papaad.getCodeCommande());
    }
  }
}
