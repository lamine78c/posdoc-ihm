package fr.acoss.posdoc.exceptions;

public class InvalidStringSizeException extends PosdocException {

  public InvalidStringSizeException(final String fieldName, final Integer limit,
                                    final String actual) {
    super(String.format(
        "La taille du champs \"%s\" est incorrect (limite : %s, actuellement : %s)",
        fieldName,
        limit == 1 ? "1 caractère" : limit + " caractères",
        actual == null ? null : actual.length() + " caractères"));
  }
}
