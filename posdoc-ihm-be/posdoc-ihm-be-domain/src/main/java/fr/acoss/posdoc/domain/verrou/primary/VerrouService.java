package fr.acoss.posdoc.domain.verrou.primary;

import fr.acoss.posdoc.domain.gammes.secondary.GammePersistence;
import fr.acoss.posdoc.domain.verrou.model.Verrou;
import fr.acoss.posdoc.domain.verrou.secondary.VerrouPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.verrou.validators.VerrouValidators.*;

public class VerrouService {

  public static final String VERROU = "Verrou";
  public static final String GAMME = "Gamme";

  private final VerrouPersistence verrouPersistence;
  private final GammePersistence gammePersistence;

  public VerrouService(final VerrouPersistence verrouPersistence, final GammePersistence gammePersistence) {
    this.verrouPersistence = verrouPersistence;
    this.gammePersistence = gammePersistence;
  }

  public Verrou createVerrou(final Verrou verrou) {

    codeValidator().validate(verrou.getCode());
    libelleValidator().validate(verrou.getLibelle());
    maxExecutionValidator().validate(verrou.getMaxExecution());

    if (verrouPersistence.exists(verrou.getCode())) {
      throw new AlreadyExistingElement(VERROU, verrou.getCode());
    }

    return verrouPersistence.create(verrou);
  }

  public Verrou updateVerrou(final Verrou verrou) {

    codeValidator().validate(verrou.getCode());
    libelleValidator().validate(verrou.getLibelle());
    maxExecutionValidator().validate(verrou.getMaxExecution());

    if (!verrouPersistence.exists(verrou.getCode())) {
      throw new ElementNotFoundException(VERROU, verrou.getCode());
    }

    return verrouPersistence.create(verrou);
  }

  public void deleteVerrous(List<String> codes) {
    // vérification dépendance Gamme
    List<String> listRes = gammePersistence.existsVerrous(codes);
    if (!listRes.isEmpty()) {
      throw new StileExistingElement(VERROU, codes, GAMME);
    }
    verrouPersistence.deleteAll(codes);
  }

}
