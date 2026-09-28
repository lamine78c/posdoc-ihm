package fr.acoss.posdoc.domain.tarpos.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidNumberBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;

import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class TarposValidatorsTest {
    @Test
    void typeValidator_nominal() {
        Stream.of("TP1", "TP", "T").forEach(
                value -> assertTrue(TarposValidators.typeValidator().validate(value))
        );
    }

    @Test
    void typeValidator_throw_exception() {
        Validator<String> validator = TarposValidators.typeValidator();
        Stream.of("", "AAAA").forEach(value ->
                assertThrows(
                        InvalidStringBoundsException.class,
                        () -> validator.validate(value)));
    }

    @Test
    void libelleValidator_nominal() {
        String longString = randomString(50);
        String shortString = "T";
        Stream.of(shortString, longString).forEach(
                value -> assertTrue(TarposValidators.libelleValidator().validate(value))
        );
    }

    @Test
    void libelleValidator_throw_exception() {
        Validator<String> validator = TarposValidators.libelleValidator();
        String tooLongString = randomString(51);
        String emprtyString = "";

        Stream.of(emprtyString, tooLongString).forEach(value ->
                assertThrows(
                        InvalidStringBoundsException.class,
                        () -> validator.validate(value),
                        "Expected InvalidStringBoundsException for value: '" + value + "'"
                )
        );
    }

    @Test
    void ordreValidator_nominal() {
        Stream.of(1, 999).forEach(value ->
                assertTrue(TarposValidators.ordreValidator().validate(value)));
    }

    @Test
    void ordreValidator_throw_exception() {
        Validator<Integer> validator = TarposValidators.ordreValidator();
        Stream.of(0, 1000).forEach(value -> {
            Executable executable = () -> validator.validate(value);
            assertThrows(
                    InvalidNumberBoundsException.class,
                    executable,
                    "Expected InvalidNumberBoundsException for value: " + value
            );
        });
    }

    private String randomString(int length) {
        return new Random()
                .ints(length, 'a', 'z' + 1)
                .mapToObj(c -> String.valueOf((char) c))
                .collect(Collectors.joining());
    }
}
