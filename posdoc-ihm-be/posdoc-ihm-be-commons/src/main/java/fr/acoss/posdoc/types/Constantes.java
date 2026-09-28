package fr.acoss.posdoc.types;

import java.util.Map;

public class Constantes {

    private Constantes() {
        throw new IllegalStateException("Utility class");
    }
    public static final int STEPNO_0 = 0;
    public static final String FICSTA_T = "T";
    public static final String PROSTA_T = "T";
    public static final Integer GENFIC_MAX_DELMSP = 99;
    public static final String CLEBON = "COD";
    public static final String APPINF_000 = "000";
    public static final String FICINF_000 = "000";
    public static final String CODSIG_S01 = "S01";
    public static final String CODSIG_S02 = "S02";
    public static final Integer LIMIT_MAX=100;
    public static final Integer LIMIT_MIN=0;
    public static final String GENERIC_ORGANISME ="999";
    public static final Map<String, String> TYPES = Map.ofEntries(
            Map.entry("0", "Demande gestionnaire"),
            Map.entry("1", "Demande cotisant"),
            Map.entry("2", "Batch mono-pdf"),
            Map.entry("3", "Batch multi-pdf")
    );
}
