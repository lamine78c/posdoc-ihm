package fr.acoss.posdoc.exceptions;

import java.time.LocalDate;

public class InvalidStartAndCloseDateException extends PosdocException {

  public InvalidStartAndCloseDateException(final LocalDate start, final LocalDate end) {
    super(String.format(
        "La date de début doit être avant la date de fin (actuellement : start=%s & fin=%s)",
        start,
        end));
  }
}
