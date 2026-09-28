package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ComposEntity;
import fr.acoss.posdoc.domain.compos.model.Compos;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ComposMapper {

  ComposMapper INSTANCE = Mappers.getMapper(ComposMapper.class);

  Compos entityToDomain(final ComposEntity composEntity);

  ComposEntity domainToEntity(final Compos compos);

}
