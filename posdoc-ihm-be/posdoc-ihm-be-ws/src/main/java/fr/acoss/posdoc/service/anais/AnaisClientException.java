package fr.acoss.posdoc.service.anais;

/**
 * Exception dédiée pour les erreurs liées au client Anais
 */
public class AnaisClientException extends Exception {

    public AnaisClientException(String message) {
        super(message);
    }

    public AnaisClientException(String message, Throwable cause) {
        super(message, cause);
    }
}
