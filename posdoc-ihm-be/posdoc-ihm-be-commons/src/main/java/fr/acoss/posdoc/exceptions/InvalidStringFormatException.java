package fr.acoss.posdoc.exceptions;

public class InvalidStringFormatException extends PosdocException {

  public InvalidStringFormatException(final String fieldName, final String exampleFormat,
                                      final String actual) {
    super(String.format(
        "Le format du champs \"%s\" est incorrect (exemple : \"%s\", actuellement : \"%s\"",
        fieldName,
        exampleFormat,
        actual));
  }

}
