package fr.acoss.posdoc.common.util;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ConvertorTest {

    @Test
    void testConvertorToInteger() {
        assertEquals(Integer.valueOf(10), ConvertorUtils.convertToInteger("10"));
        final var invalidInput = "a";
        Exception exception = assertThrows(NumberFormatException.class, () -> ConvertorUtils.convertToInteger(invalidInput));
        assertEquals("For input string: \"a\"", exception.getMessage());
    }


    @Test
    void testConvertStringToSplitToArrayString() {
        String value = "50,25,1";
        List<String> result = ConvertorUtils.convertStringToSplitToArrayString(value, ",");
        assertEquals("50", result.get(0));
        assertEquals("25", result.get(1));
        assertEquals("1", result.get(2));

        List<String> nullResult = ConvertorUtils.convertStringToSplitToArrayString(null, ",");
        assertNotNull(nullResult);
        assertTrue(nullResult.isEmpty());
    }
}
