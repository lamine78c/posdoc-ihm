package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.colimp.model.Colimp;
import fr.acoss.posdoc.ws.resolvers.query.ColimpDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ColimpMapper {

  ColimpMapper INSTANCE = Mappers.getMapper(ColimpMapper.class);

  ColimpDTO domainToDTO(final Colimp colimp);
}
