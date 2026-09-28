package fr.acoss.posdoc.exceptions;

public class NotManagedSearchOperationException extends PosdocException {

  public NotManagedSearchOperationException(final String operation) {
    super(String.format("L'opération %s n'est pas géré pour le moment", operation));
  }

}
