package fr.acoss.posdoc.exceptions;

public class PDFGenerationException extends PosdocException {

    public PDFGenerationException(final String message) {
        super(message);
    }

    public PDFGenerationException(final String message, final Throwable throwable) {
        super(message, throwable);
    }
}
