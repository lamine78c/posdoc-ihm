package fr.acoss.posdoc.common.util;

public class ErrorMessageUtils {

    // Error messages - Bon de travail
    public static final String ERROR_PDF_FILE_NOT_FOUND = "Le fichier PDF '%s' n'a pas été trouvé dans le répertoire '%s'. Vérifiez que le bon de travail existe.";
    public static final String ERROR_PDF_FILE_READ = "Erreur lors de la lecture du fichier PDF '%s' depuis le répertoire '%s'. Vérifiez les permissions d'accès au fichier.";
    public static final String ERROR_ADELAIDE_NOT_CONFIGURED = "Le serveur Adelaide n'est pas configuré et le fichier n'a pas été trouvé localement. Veuillez contacter l'administrateur.";
    public static final String ERROR_PDF_FILE_NOT_FOUND_ADELAIDE = "Le fichier PDF '%s' n'a pas été trouvé sur le serveur Adelaide. Vérifiez que le bon de travail existe.";
    public static final String ERROR_ADELAIDE_TIMEOUT = "Le serveur Adelaide (%s) ne répond pas ou a mis trop de temps à répondre. Le fichier demandé est '%s'. Veuillez réessayer ultérieurement ou contacter l'administrateur si le problème persiste.";
    public static final String ERROR_ADELAIDE_COMMUNICATION = "Erreur de communication avec le serveur Adelaide lors du téléchargement du fichier '%s'. Vérifiez la connectivité réseau et réessayez.";

    private ErrorMessageUtils() {
        throw new IllegalStateException("Utility class");
    }

}
