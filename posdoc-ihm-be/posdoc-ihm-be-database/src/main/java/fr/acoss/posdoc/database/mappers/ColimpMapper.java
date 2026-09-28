package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ColimpEntity;
import fr.acoss.posdoc.domain.colimp.model.Colimp;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ColimpMapper {

  ColimpMapper INSTANCE = Mappers.getMapper(ColimpMapper.class);

  Colimp entityToDomain(final ColimpEntity colimpEntity);

  ColimpEntity domainToEntity(final Colimp colimp);

}
