package fr.acoss.posdoc.common.util;

import fr.acoss.posdoc.types.Constantes;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class ConvertorUtils {

    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private ConvertorUtils() {
        throw new IllegalStateException("Utility class");
    }

    public static Integer convertToInteger(final String value) {
        if (value != null) {
            return Integer.parseInt(value);
        }
        return null;
    }

    public static List<String> convertStringToSplitToArrayString(final String value, final String regex) {
        if (value != null) {
            return List.of(value.split(regex));
        }
        return List.of();
    }

    public static Float convertCoutTotal(final String value) {
        if (value != null) {
            int intValue = Integer.parseInt(value);
            return (float) intValue / 1000;
        }
        return null;
    }

    public static String convertDateToDatdem(String value) {
        // dateTime 2023-01-23 01:22:18 to format 20230123
        if (value != null) {
            return String.join("", value.split(" ")[0].split("-"));
        }
        return null;
    }

    public static BigDecimal convertToBigDecimal(String value) {
        if (value != null) {
            return new BigDecimal(value);
        }
        return null;
    }

    public static String convertDateToString(Object dateObj) {
        if (dateObj != null) {
            if (dateObj instanceof Date) {
                SimpleDateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT);
                return dateFormat.format((Date) dateObj);
            } else {
                return dateObj.toString();
            }
        }
        return null;
    }

    public static Integer convertFromBigDecimalToInteger(BigDecimal bd) {
        if (bd != null) {
            return bd.intValue();
        }
        return null;
    }

    /**
     * Converts an Object to String
     * @param value the object to convert
     * @return the string representation of the object, or null if the object is null
     */
    public static String convertToString(Object value) {
        if (value == null) {
            return null;
        }
        return value.toString();
    }

    public static String getTypeFromTypact(String typact) {
        return Constantes.TYPES.get(typact);
    }
}
