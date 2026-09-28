package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateServerInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateServerPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ServerDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ServerMapper {

  ServerMapper INSTANCE = Mappers.getMapper(ServerMapper.class);

  ServerDTO domainToDTO(final Server server);

  Server inputDTOToDomain(final CreateOrUpdateServerInputDTO inputDTO);

  CreateOrUpdateServerPayloadDTO domainToPayloadDTO(final Server server);

}
