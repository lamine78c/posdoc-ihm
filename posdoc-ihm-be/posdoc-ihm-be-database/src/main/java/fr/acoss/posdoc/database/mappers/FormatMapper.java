package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.FormatEntity;
import fr.acoss.posdoc.domain.format.model.Format;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FormatMapper {

  FormatMapper INSTANCE = Mappers.getMapper(FormatMapper.class);

  Format entityToDomain(final FormatEntity formatEntity);

  FormatEntity domainToEntity(final Format format);

}
