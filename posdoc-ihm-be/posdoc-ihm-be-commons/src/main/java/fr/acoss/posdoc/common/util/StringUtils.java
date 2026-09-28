package fr.acoss.posdoc.common.util;

public class StringUtils {

    public static final String EMPTY = "";
    public static final String UNDERSCORE="_";
    public static final String EQUAL = "=";
    public static final String ESPACE =" ";
    public static final String DASH = "-";
    public static final String PERCENT = "%";
    public static final String SLASH = "/";
    public static final String POUND = "£";
    public static final String DOT = ".";
    public static final String COMMA = ",";
    public static final String SIMPLE_QUOTE = "'";
    public static final String TWO_POINTS = ":";
    public static final String START_BRACKET = "{";
    public static final String END_BRACKET = "}";
    public static final String SHARP = "#";
    public static final String START_QUERY_PARAM = SHARP + START_BRACKET + SHARP;
    public static final String NOTICES_DIRECTORY = "notices.directory";
    public static final String MAX_FILE_SIZE = "notices.file.max-size";
    public static final String QUERY_RESULTS_MAX_SIZE = "query.results.max-size";
    public static final String QUERY_RESULTS_MAX_SIZE_MESSAGE = "Le nombre d'éléments trouvés dépasse la limite maximale autorisée de ";

    // Bon de travail configuration
    public static final String CONFIG_BON_TRAVAIL_DIRECTORY = "bon-travail.directory";
    public static final String CONFIG_ADELAIDE_SERVER_HOST = "adelaide-server.host";
    public static final String CONFIG_ADELAIDE_EXPORT_PATH = "adelaide-server.export-path";

    // Bon de travail file naming
    public static final String PDF_EXTENSION = ".pdf";
    public static final String BON_TRAVAIL_PREFIX = "BDT_";

    // Adelaide server defaults
    public static final String HTTP_PROTOCOL = "http://";

    private StringUtils() {
        throw new IllegalStateException("Utility class");
    }

    public static boolean isNotEmpty(String value) {
        return value != null && !value.isEmpty();
    }

}
