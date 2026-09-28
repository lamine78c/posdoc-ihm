package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.TypeSignature;

import javax.persistence.AttributeConverter;

public class FichierTypeSignature implements AttributeConverter<TypeSignature, String> {

  @Override
  public String convertToDatabaseColumn(TypeSignature attribute) {
    return attribute.getShortValue();
  }

  @Override
  public TypeSignature convertToEntityAttribute(String dbData) {
    return TypeSignature.fromValue(dbData);
  }
}
