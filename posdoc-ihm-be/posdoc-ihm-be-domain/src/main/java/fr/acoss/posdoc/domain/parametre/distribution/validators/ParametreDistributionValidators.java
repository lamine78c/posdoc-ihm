package fr.acoss.posdoc.domain.parametre.distribution.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class ParametreDistributionValidators {

    private ParametreDistributionValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> referenceValidator() {
        return stringSizeValidatorMaxInclude(0, 12).orThrow(v -> new InvalidStringBoundsException("reference",
                1,
                12,
                v));
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
                1,
                50,
                v));
    }

    public static Validator<String> commandeDistributionValidator() {
        return stringSizeValidatorMaxInclude(0, 1000).orThrow(v -> new InvalidStringBoundsException("commanderDistribution",
                1,
                1000,
                v));
    }

}
