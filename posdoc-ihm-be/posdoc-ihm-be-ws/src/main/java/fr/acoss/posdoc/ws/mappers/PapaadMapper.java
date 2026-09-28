package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.papaad.model.Papaad;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdatePapaadInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdatePapaadPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PapaadDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface PapaadMapper {

  PapaadMapper INSTANCE = Mappers.getMapper(PapaadMapper.class);

  PapaadDTO domainToDTO(final Papaad papaad);

  Papaad inputDTOToDomain(final CreateOrUpdatePapaadInputDTO createOrUpdatePapaadInputDTO);

  CreateOrUpdatePapaadPayloadDTO domainToPayloadDTO(final Papaad papaad);

}
