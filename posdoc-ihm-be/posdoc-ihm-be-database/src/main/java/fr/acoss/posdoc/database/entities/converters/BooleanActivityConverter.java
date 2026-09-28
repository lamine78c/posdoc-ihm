package fr.acoss.posdoc.database.entities.converters;

import javax.persistence.AttributeConverter;

public class BooleanActivityConverter implements AttributeConverter<String, Integer> {

  private static final String INACTIF = "Inactif";
  private static final String ACTIF = "Actif";
  private static final Integer TRUE_INT = 1;
  private static final Integer FALSE_INT = 0;

  @Override
  public Integer convertToDatabaseColumn(String attribute) {
    if (attribute == null) {
      return null;
    } else if (ACTIF.equals(attribute)) {
      return TRUE_INT;
    } else {
      return FALSE_INT;
    }
  }

  @Override
  public String convertToEntityAttribute(Integer dbData) {
    if (dbData == null) {
      return null;
    } else if (TRUE_INT.equals(dbData)) {
      return ACTIF;
    } else {
      return INACTIF;
    }
  }
}
