package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateClientInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateClientPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ClientDTO;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ClientMapper {

  ClientMapper INSTANCE = Mappers.getMapper(ClientMapper.class);

  ClientDTO domainToDTO(final Client client);

  Client inputDTOToDomain(final CreateOrUpdateClientInputDTO createOrUpdateClientInputDTO);

  CreateOrUpdateClientPayloadDTO domainToPayloadDTO(final Client client);

}
