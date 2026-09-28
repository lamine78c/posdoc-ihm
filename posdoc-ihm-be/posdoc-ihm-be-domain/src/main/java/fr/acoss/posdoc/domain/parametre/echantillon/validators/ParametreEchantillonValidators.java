package fr.acoss.posdoc.domain.parametre.echantillon.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidNumberBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.positiveValueValidatorOnInteger;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class ParametreEchantillonValidators {

    private ParametreEchantillonValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> referenceValidator() {
        return stringSizeValidatorMaxInclude(0, 8).orThrow(v -> new InvalidStringBoundsException("reference",
                1,
                8,
                v));
    }

    public static Validator<Integer> nombreLotsValidator() {
        final Validator<Integer> validator = v -> positiveValueValidatorOnInteger().validate(v)
                && v < 1000;
        return validator.orThrow(v -> new InvalidNumberBoundsException("nombreLots", 0, 999, v));
    }

    public static Validator<Integer> nombrePagesValidator() {
        final Validator<Integer> validator = v -> positiveValueValidatorOnInteger().validate(v)
                && v < 1000;
        return validator.orThrow(v -> new InvalidNumberBoundsException("nombrePages", 0, 999, v));
    }

    public static Validator<String> formuleValidator() {
        return stringSizeValidatorMaxInclude(0, 100).orThrow(v -> new InvalidStringBoundsException("formule",
                1,
                100,
                v));
    }

}
