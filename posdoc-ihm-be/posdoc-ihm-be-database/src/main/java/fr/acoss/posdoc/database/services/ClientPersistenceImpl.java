package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ClientRepository;
import fr.acoss.posdoc.database.entities.ClientEntity;
import fr.acoss.posdoc.database.mappers.ClientMapper;
import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.domain.client.secondary.ClientPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ClientPersistenceImpl extends AbstractObjectPersistence<ClientEntity, String, Client>
    implements ClientPersistence {

  private static final  ClientMapper MAPPER = ClientMapper.INSTANCE;

  private final ClientRepository clientRepository;

  public ClientPersistenceImpl(
      ClientRepository clientRepository) {this.clientRepository = clientRepository;}

  @Override
  protected JpaSpecificationExecutor<ClientEntity> getSpecificationExecutor() {
    return clientRepository;
  }

  @Override
  protected JpaRepository<ClientEntity, String> getRepository() {
    return clientRepository;
  }

  @Override
  protected Function<ClientEntity, Client> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Client, ClientEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Client> selectAll() {
    return clientRepository.findAllByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    clientRepository.deleteByCodeIn(ids);
  }

}
