package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateHabilitationInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateHabilitationPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.HabilitationDTO;


import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HabilitationMapper {

    HabilitationMapper INSTANCE = Mappers.getMapper(HabilitationMapper.class);

    HabilitationDTO domainToDTO(final Habilitation habilitation);

    Habilitation inputDTOToDomain(final CreateOrUpdateHabilitationInputDTO inputDTO);

    CreateOrUpdateHabilitationPayloadDTO domainToPayloadDTO(final Habilitation habilitation);
}
