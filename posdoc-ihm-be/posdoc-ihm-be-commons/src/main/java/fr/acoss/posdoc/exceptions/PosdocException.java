package fr.acoss.posdoc.exceptions;

import java.util.HashMap;
import java.util.Map;

public class PosdocException extends RuntimeException {

  public PosdocException(final String message) {
    super(message);
  }

  public PosdocException(final String message, final Throwable throwable) {
    super(message, throwable);
  }

  public Map<String, Object> getExtensions() {
    return new HashMap<>();
  }

}
