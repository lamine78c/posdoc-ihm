package fr.acoss.posdoc.domain.server.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class ServerValidators {

  private ServerValidators() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> codeValidator() {
    return stringSizeValidatorMaxInclude(0, 8).orThrow(value -> new InvalidStringBoundsException("ID serveur",
        1,
        8,
        value));
  }

  public static Validator<String> libelleValidator() {
    return stringSizeValidatorMaxInclude(0, 50).orThrow(value -> new InvalidStringBoundsException("libelle",
        1,
        50,
        value));
  }

  public static Validator<String> adresseIpValidator() {
    return stringSizeValidatorMaxInclude(0, 32).orThrow(value -> new InvalidStringBoundsException("adresse IP",
        1,
        32,
        value));
  }

}
