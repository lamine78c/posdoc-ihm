package fr.acoss.posdoc.domain.imprime.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;

import java.util.Objects;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.*;

public class ImprimeValidators {

  private ImprimeValidators() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> referenceValidator() {
    return stringSizeValidatorMaxInclude(0, 8).orThrow(value -> new InvalidStringBoundsException("reference",
        1,
        8,
        value));
  }

  public static Validator<String> libelleValidator() {
    return stringSizeValidator(0, 50).orThrow(value -> new InvalidStringBoundsException("libelle",
        1,
        50,
        value));
  }

  public static Validator<String> codeRNDValidator() {
    return ((Validator<String>) v -> Objects.isNull(v) || stringSizeValidatorMaxAndMinInclude(0, 14)
        .validate(v)).orThrow(value -> new InvalidStringBoundsException("codeRND", 0, 14, value));

  }

  public static Validator<String> typeCompositionValidator() {
    return stringSizeValidatorEquals(1).orThrow(value -> new InvalidStringSizeException("typeComposition",
        1,
        value));
  }

  public static Validator<String> typeCouleurValidator() {
    return stringSizeValidatorEquals(1).orThrow(value -> new InvalidStringSizeException(
        "typeCouleur",
        1,
        value));
  }

}
