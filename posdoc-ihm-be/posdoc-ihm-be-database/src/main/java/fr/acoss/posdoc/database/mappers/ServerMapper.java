package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ServerEntity;
import fr.acoss.posdoc.domain.server.model.Server;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ServerMapper {

  ServerMapper INSTANCE = Mappers.getMapper(ServerMapper.class);

  Server entityToDomain(final ServerEntity serverEntity);

  ServerEntity domainToEntity(final Server server);

}

