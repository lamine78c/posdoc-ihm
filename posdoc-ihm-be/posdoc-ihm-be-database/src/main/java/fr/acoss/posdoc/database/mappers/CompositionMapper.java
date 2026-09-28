package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.CompositionEntity;
import fr.acoss.posdoc.domain.composition.model.Composition;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface CompositionMapper {

  CompositionMapper INSTANCE = Mappers.getMapper(CompositionMapper.class);

  Composition entityToDomain(final CompositionEntity compositionEntity);

  CompositionEntity domainToEntity(final Composition composition);

}
