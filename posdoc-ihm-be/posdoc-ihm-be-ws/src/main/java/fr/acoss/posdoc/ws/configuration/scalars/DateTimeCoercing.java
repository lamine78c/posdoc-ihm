package fr.acoss.posdoc.ws.configuration.scalars;

import fr.acoss.posdoc.common.util.DateUtils;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;


public class DateTimeCoercing implements Coercing<LocalDateTime, String> {

    public static final String AS_A_DATE_TIME = " as a date time";
    public static final String UNABLE_TO_PARSE_VARIABLE_VALUE = "Unable to parse variable value ";
    public static final String UNABLE_TO_SERIALIZE = "Unable to serialize ";

    @Override
    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {

        if (dataFetcherResult instanceof LocalDateTime) {
            final var date = (LocalDateTime) dataFetcherResult;
            return DateUtils.DATE_TIME_FORMATTER.format(date);
        }

        throw new CoercingSerializeException(
                UNABLE_TO_SERIALIZE + dataFetcherResult + AS_A_DATE_TIME);
    }

    @Override
    public LocalDateTime parseValue(Object input) throws CoercingParseValueException {
        //ie variable => String
        try {
            if (input instanceof String) {
                final var date = (String) input;
                return LocalDateTime.parse(date, DateUtils.DATE_TIME_FORMATTER);
            }
            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE_TIME);

        } catch (final DateTimeParseException dateTimeParseException) {
            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE_TIME, dateTimeParseException);
        }
    }

    @Override
    public LocalDateTime parseLiteral(Object input) throws CoercingParseLiteralException {
        //AST Literal
        try {
            if (input instanceof StringValue) {
                final var dateText = ((StringValue) input).getValue();
                return LocalDateTime.parse(dateText, DateUtils.DATE_TIME_FORMATTER);
            }

            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE_TIME);

        } catch (final DateTimeParseException dateTimeParseException) {
            throw new CoercingParseValueException(
                    UNABLE_TO_PARSE_VARIABLE_VALUE + input + AS_A_DATE_TIME, dateTimeParseException);
        }
    }
}
