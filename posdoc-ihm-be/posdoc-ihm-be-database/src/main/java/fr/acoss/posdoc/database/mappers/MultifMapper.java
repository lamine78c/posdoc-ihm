package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.MultifEntity;
import fr.acoss.posdoc.domain.multif.model.Multif;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MultifMapper {

  MultifMapper INSTANCE = Mappers.getMapper(MultifMapper.class);

  Multif entityToDomain(final MultifEntity multifEntity);

  MultifEntity domainToEntity(final Multif multif);

}
