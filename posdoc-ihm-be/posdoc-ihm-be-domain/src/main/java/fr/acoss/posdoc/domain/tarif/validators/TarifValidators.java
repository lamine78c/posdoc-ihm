package fr.acoss.posdoc.domain.tarif.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringFormatException;
import fr.acoss.posdoc.exceptions.NegativeValueForbiddenException;

import java.util.regex.Pattern;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.positiveValueValidatorOnDouble;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class TarifValidators {

  private TarifValidators() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> typeValidator() {
    return stringSizeValidatorMaxInclude(0, 3).orThrow(v -> new InvalidStringBoundsException("type",
        1,
        3,
        v));
  }

  public static Validator<String> numeroValidator() {
    return ((Validator<String>) v -> Pattern.matches("\\d{4}", v))
        .orThrow(v -> new InvalidStringFormatException("numero", "1234", v));
  }

  public static Validator<Double> coutPliValidator() {
    return positiveValueValidatorOnDouble().orThrow(v -> new NegativeValueForbiddenException(
        "coutPli"));
  }

}
