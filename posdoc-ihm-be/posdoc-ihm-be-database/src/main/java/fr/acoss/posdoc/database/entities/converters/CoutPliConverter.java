package fr.acoss.posdoc.database.entities.converters;

import javax.persistence.AttributeConverter;
import java.math.BigDecimal;

public class CoutPliConverter implements AttributeConverter<Double, Integer> {

  private static final Double CONVERSION_VALUE = 1000.0;

  @Override
  public Integer convertToDatabaseColumn(Double attribute) {
    return new BigDecimal(attribute.toString())
            .multiply(new BigDecimal(CONVERSION_VALUE.toString())).intValue();
  }

  @Override
  public Double convertToEntityAttribute(Integer dbData) {
    return dbData / CONVERSION_VALUE;
  }
}
