package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.TypeRefection;

import javax.persistence.AttributeConverter;

public class TypeRefectionConverter implements AttributeConverter<TypeRefection, String> {

  @Override
  public String convertToDatabaseColumn(TypeRefection typeRefection) {
    return typeRefection.getShortValue();
  }

  @Override
  public TypeRefection convertToEntityAttribute(String dbData) {
    return TypeRefection.fromValue(dbData);
  }
}
