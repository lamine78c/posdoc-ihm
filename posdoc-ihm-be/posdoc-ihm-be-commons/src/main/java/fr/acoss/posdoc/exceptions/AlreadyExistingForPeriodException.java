package fr.acoss.posdoc.exceptions;

public class AlreadyExistingForPeriodException extends PosdocException {

    public AlreadyExistingForPeriodException() {
      super("Un tarif existe déjà sur cette période.");
    }
}
