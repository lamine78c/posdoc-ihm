package fr.acoss.posdoc.types;

public class LogMessages {
    public static final String SEARCH_STARTED = "🔍 Recherche des informations vidéo pour query={}";
    public static final String NO_DOCUMENT_FOUND = "⚠️ Aucun document trouvé pour query={}";
    public static final String DOCUMENT_FOUND = "✅ Document trouvé : {}";
    public static final String NO_NOTFIC_FOUND = "⚠️ Aucune Affectation notices trouvée pour query={}";

    private LogMessages() {
        // Private constructor to prevent instantiation
    }
}
