package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.TypeEchantillon;

import javax.persistence.AttributeConverter;

public class TypeEchantillonConverter implements AttributeConverter<TypeEchantillon, String> {

  @Override
  public String convertToDatabaseColumn(TypeEchantillon typeEchantillon) {
    return typeEchantillon.getShortValue();
  }

  @Override
  public TypeEchantillon convertToEntityAttribute(String dbData) {
    return TypeEchantillon.fromValue(dbData);
  }
}
