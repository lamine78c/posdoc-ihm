package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ServerRepository;
import fr.acoss.posdoc.database.entities.ServerEntity;
import fr.acoss.posdoc.database.mappers.ServerMapper;
import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.domain.server.secondary.ServerPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ServerPersistenceImpl extends AbstractObjectPersistence<ServerEntity, String, Server>
    implements ServerPersistence {

  private static final ServerMapper MAPPER = ServerMapper.INSTANCE;

  private final ServerRepository serverRepository;

  public ServerPersistenceImpl(
      ServerRepository serverRepository) {this.serverRepository = serverRepository;}

  @Override
  protected JpaSpecificationExecutor<ServerEntity> getSpecificationExecutor() {
    return serverRepository;
  }

  @Override
  protected JpaRepository<ServerEntity, String> getRepository() {
    return serverRepository;
  }

  @Override
  protected Function<ServerEntity, Server> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Server, ServerEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Server> selectAll() {
    return serverRepository.findAllByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    serverRepository.deleteByCodeIn(ids);
  }

  @Override
  public List<Server> updateAll(List<Server> servers) {
    var entity = servers.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return serverRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
}
