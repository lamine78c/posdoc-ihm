package fr.acoss.posdoc.domain.common.validator;

import fr.acoss.posdoc.exceptions.NullFieldException;

import java.util.Objects;

public class CommonValidators {

    private CommonValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> stringSizeValidator(final Integer min, final Integer max) {
        Objects.requireNonNull(min);
        Objects.requireNonNull(max);
        return s -> Objects.nonNull(s) && s.length() > min && s.length() < max;
    }

    public static Validator<String> stringSizeValidatorMaxInclude(final Integer min,
                                                                  final Integer max) {
        Objects.requireNonNull(min);
        Objects.requireNonNull(max);
        return s -> Objects.nonNull(s) && s.length() > min && s.length() <= max;
    }

    public static Validator<String> stringSizeValidatorMaxAndMinInclude(final Integer min,
                                                                  final Integer max) {
        Objects.requireNonNull(min);
        Objects.requireNonNull(max);
        return s -> Objects.nonNull(s) && s.length() >= min && s.length() <= max;
    }

    public static Validator<String> stringSizeValidatorEquals(final Integer size) {
        Objects.requireNonNull(size);
        return s -> Objects.nonNull(s) && s.length() == size;
    }

    public static Validator<Double> positiveValueValidatorOnDouble() {
        return d -> Objects.nonNull(d) && d > 0;
    }

    public static Validator<Integer> positiveValueValidatorOnInteger() {
        return i -> Objects.nonNull(i) && i > 0;
    }

    public static Validator<Object> objectNotNull() {
        return Objects::nonNull;
    }

    public static Validator<Object> objectNotNullOrThrow(final String fieldName) {
        return ((Validator<Object>) Objects::nonNull).orThrow(unused -> new NullFieldException(
                fieldName));
    }

}
