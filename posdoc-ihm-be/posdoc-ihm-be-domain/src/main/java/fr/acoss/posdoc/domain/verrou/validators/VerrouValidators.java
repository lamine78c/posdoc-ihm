package fr.acoss.posdoc.domain.verrou.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidNumberBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.positiveValueValidatorOnInteger;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class VerrouValidators {

    private VerrouValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> codeValidator() {
        return stringSizeValidatorMaxInclude(0, 8).orThrow(v -> new InvalidStringBoundsException("code",
                1,
                8,
                v));
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
                1,
                50,
                v));
    }

    public static Validator<Integer> maxExecutionValidator() {
        final Validator<Integer> validator = v -> positiveValueValidatorOnInteger().validate(v)
                && v < 1000;
        return validator.orThrow(v -> new InvalidNumberBoundsException("maxExecution", 0, 999, v));
    }

}
