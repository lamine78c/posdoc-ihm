package fr.acoss.posdoc.domain.utilog;

public class UtiLogUtil {

    public static final String ACT_TERMINER = "Terminer";
    public static final String ACT_VALIDER = "Valider";
    public static final String ACT_INVALIDER = "Invalider";
    public static final String ACT_MASSIFIER = "Massifier";
    public static final String ACT_SIMULER = "Simuler";
    public static final String PARAM_PREFIX_GENAPP = "Genapp: ";
    public static final String PARAM_PREFIX_GENETP = "Genetp: ";
    public static final String PARAM_PREFIX_GENFIC = "Genfic: ";
    public static final String PARAM_SEP = "-";
    public static final String PARAM_DELETE_FILE_MAS = "Suppression les fichiers de la massification: ";
    public static final String ERR_ANNULATION = "Annulation de l'opération";
    public static final String NO_ERR = null;

    private UtiLogUtil() {
    }

    public static String normaliseParam(final String strOrig) {
        StringBuilder strDest = new StringBuilder();
        for (char currentChar : strOrig.toCharArray()) {
            if (currentChar == '\'') {
                strDest.append('\'');
            }
            strDest.append(currentChar);
        }
        return strDest.toString();
    }
}
