package fr.acoss.posdoc.types;

public class ErrorMessages {
    public static final String QUERY_NULL = "La requête ne peut pas être nulle";
    public static final String DATDEM_REQUIRED = "Le champ datdem est obligatoire";
    public static final String NUMDEM_REQUIRED = "Le champ numdem est obligatoire";
    public static final String DATDEM_INVALID = "Format de date invalide pour datdem";
    public static final String DOCUMENT_NOT_FOUND = "Aucun document vidéo information detail trouvé pour les critères spécifiés";
    public static final String RETRIEVAL_ERROR = "Erreur lors de la récupération des informations vidéo";

    private ErrorMessages() {
        // Private constructor to prevent instantiation
    }
}