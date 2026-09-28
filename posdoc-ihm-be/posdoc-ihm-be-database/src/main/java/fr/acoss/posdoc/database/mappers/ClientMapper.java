package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ClientEntity;
import fr.acoss.posdoc.domain.client.model.Client;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ClientMapper {

  ClientMapper INSTANCE = Mappers.getMapper(ClientMapper.class);

  Client entityToDomain(final ClientEntity clientEntity);

  ClientEntity domainToEntity(final Client client);

}
