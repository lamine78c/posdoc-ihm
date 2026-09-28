package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.Systeme;

import javax.persistence.AttributeConverter;

public class SystemeConverter implements AttributeConverter<Systeme, String> {

  @Override
  public String convertToDatabaseColumn(Systeme attribute) {
    return attribute.getShortValue();
  }

  @Override
  public Systeme convertToEntityAttribute(String dbData) {
    return Systeme.fromValue(dbData);
  }
}
