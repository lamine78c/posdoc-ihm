package fr.acoss.posdoc.database.entities.converters;

import javax.persistence.AttributeConverter;

public class BooleanConverter implements AttributeConverter<Boolean, Integer> {

  private static final Integer TRUE_INT = 1;
  private static final Integer FALSE_INT = 0;

  @Override
  public Integer convertToDatabaseColumn(Boolean attribute) {
    if (attribute == null) {
      return null;
    } else if (Boolean.TRUE.equals(attribute)) {
      return TRUE_INT;
    } else {
      return FALSE_INT;
    }
  }

  @Override
  public Boolean convertToEntityAttribute(Integer dbData) {

    if (dbData == null) {
      return null;//NOSONAR
    } else if (TRUE_INT.equals(dbData)) {
      return Boolean.TRUE;
    } else {
      return Boolean.FALSE;
    }
  }
}
