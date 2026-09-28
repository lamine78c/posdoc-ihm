package fr.acoss.posdoc.domain.tarpos.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidNumberBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.positiveValueValidatorOnInteger;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class TarposValidators {

    private TarposValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> typeValidator() {
        return stringSizeValidatorMaxInclude(0, 3).orThrow(v -> new InvalidStringBoundsException("libelle",
                1,
                3,
                v));
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
                1,
                50,
                v));
    }

    public static Validator<Integer> ordreValidator() {
        final Validator<Integer> validator = v -> positiveValueValidatorOnInteger().validate(v)
                && v < 1000;
        return validator.orThrow(v -> new InvalidNumberBoundsException("ordre", 0, 999, v));
    }


}
