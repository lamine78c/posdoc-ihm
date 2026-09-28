package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import fr.acoss.posdoc.ws.resolvers.inputs.TarposDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TarposMapper {
    TarposMapper INSTANCE = Mappers.getMapper(TarposMapper.class);

    Tarpos domainToPayloadDTO(final Tarpos tarpos);

    Tarpos inputDTOToDomain(final TarposDTO updateTarifDTO);
}
