package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.compos.model.Compos;
import fr.acoss.posdoc.ws.resolvers.query.ComposDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ComposMapper {

  ComposMapper INSTANCE = Mappers.getMapper(ComposMapper.class);

  ComposDTO domainToDTO(final Compos compos);
}
