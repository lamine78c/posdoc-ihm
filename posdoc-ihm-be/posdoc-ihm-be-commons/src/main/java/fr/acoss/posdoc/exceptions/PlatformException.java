package fr.acoss.posdoc.exceptions;

public class PlatformException extends PosdocException {

  public PlatformException(final String message) {
    super(message);
  }

  public PlatformException(final String message, final Throwable throwable) {
    super(message, throwable);
  }

}
