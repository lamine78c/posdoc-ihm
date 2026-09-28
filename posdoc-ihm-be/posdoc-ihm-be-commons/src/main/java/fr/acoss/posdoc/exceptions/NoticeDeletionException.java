package fr.acoss.posdoc.exceptions;

public class NoticeDeletionException extends PosdocException {
    public NoticeDeletionException(String codnot) {
        super("Notice with codnot " + codnot + " is used in Notific and cannot be deleted.");
    }
}
