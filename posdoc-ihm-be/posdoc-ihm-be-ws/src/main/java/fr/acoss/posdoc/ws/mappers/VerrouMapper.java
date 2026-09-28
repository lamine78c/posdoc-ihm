package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.verrou.model.Verrou;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateVerrouInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateVerrouPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.VerrouDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface VerrouMapper {

  VerrouMapper INSTANCE = Mappers.getMapper(VerrouMapper.class);

  VerrouDTO domainToDTO(final Verrou verrou);

  CreateOrUpdateVerrouPayloadDTO domainToPayloadDTO(final Verrou verrou);

  Verrou inputDTOToDomain(final CreateOrUpdateVerrouInputDTO createOrUpdateDTO);

}
