package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.genpro.model.GenPro;
import fr.acoss.posdoc.ws.resolvers.query.GenProDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenProMapper {

  GenProMapper INSTANCE = Mappers.getMapper(GenProMapper.class);

  GenProDTO domainToDTO(final GenPro genPro);
}

