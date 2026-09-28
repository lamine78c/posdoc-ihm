package fr.acoss.posdoc.ws.configuration.scalars;

import fr.acoss.posdoc.common.util.DateUtils;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class DateCoercing implements Coercing<LocalDate, String> {


    public static final String AS_A_DATE = " as a date";
    public static final String UNABLE_TO_PARSE_VARIABLE_VALUE = "Unable to parse variable value ";
    public static final String UNABLE_TO_SERIALIZE = "Unable to serialize ";

    @Override
    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
        if (dataFetcherResult instanceof LocalDate) {
            final var date = (LocalDate) dataFetcherResult;
            return DateUtils.DATE_FORMATTER.format(date);
        }

        throw new CoercingSerializeException(UNABLE_TO_SERIALIZE + dataFetcherResult + AS_A_DATE);
    }

    @Override
    public LocalDate parseValue(Object input) throws CoercingParseValueException {
        //ie variable => String
        try {
            if (input instanceof String) {
                final var date = (String) input;
                return LocalDate.parse(date, DateUtils.DATE_FORMATTER);
            }
            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE);

        } catch (final DateTimeParseException dateTimeParseException) {
            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE, dateTimeParseException);
        }
    }

    @Override
    public LocalDate parseLiteral(Object input) throws CoercingParseLiteralException {
        //AST Literal
        try {
            if (input instanceof StringValue) {
                final var dateText = ((StringValue) input).getValue();
                return LocalDate.parse(dateText, DateUtils.DATE_FORMATTER);
            }

            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE);

        } catch (final DateTimeParseException dateTimeParseException) {
            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE, dateTimeParseException);
        }
    }
}
