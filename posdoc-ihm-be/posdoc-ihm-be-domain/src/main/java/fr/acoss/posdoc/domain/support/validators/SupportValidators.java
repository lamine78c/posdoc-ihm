package fr.acoss.posdoc.domain.support.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidNumberBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.positiveValueValidatorOnInteger;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorEquals;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class SupportValidators {

    private SupportValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> typeValidator() {
        return stringSizeValidatorEquals(1).orThrow(s -> new InvalidStringSizeException("type",
                1,
                s));
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(s -> new InvalidStringBoundsException("libelle",
                0,
                50,
                s));
    }

    public static Validator<Integer> poidsValidator() {
        final Validator<Integer> validator = v -> positiveValueValidatorOnInteger().validate(v)
                && v < 1_000_000;
        return validator.orThrow(v -> new InvalidNumberBoundsException("poids", 0, 999_999, v));
    }

}
