package fr.acoss.posdoc.types;

public class Statut {

    private Statut() {
        throw new IllegalStateException("Utility class");
    }

    public static final String SUSPENDU = "S";
    public static final String DEBUTE = "D";
    public static final String VALIDE = "V";
    public static final String INVALIDE = "I";
    public static final String TERMINE = "T";
    public static final String HISTORIQUE = "H";
    public static final String CREE = "C";
}
