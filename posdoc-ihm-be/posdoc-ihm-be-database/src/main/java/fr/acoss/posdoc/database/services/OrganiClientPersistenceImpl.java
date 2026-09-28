package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.OrganiClientRepository;
import fr.acoss.posdoc.database.entities.OrganiClientCompositeId;
import fr.acoss.posdoc.database.entities.OrganiClientEntity;
import fr.acoss.posdoc.database.mappers.OrganiClientMapper;
import fr.acoss.posdoc.domain.organiclient.model.OrganiClient;
import fr.acoss.posdoc.domain.organiclient.secondary.OrganiClientPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrganiClientPersistenceImpl extends AbstractObjectPersistence<OrganiClientEntity, OrganiClientCompositeId, OrganiClient>
    implements OrganiClientPersistence {

  private static final OrganiClientMapper MAPPER = OrganiClientMapper.INSTANCE;

  private final OrganiClientRepository organiClientRepository;

  public OrganiClientPersistenceImpl(OrganiClientRepository organiClientRepository) {
    this.organiClientRepository = organiClientRepository;
  }

  @Override
  protected JpaSpecificationExecutor<OrganiClientEntity> getSpecificationExecutor() {
    return organiClientRepository;
  }

  @Override
  protected JpaRepository<OrganiClientEntity, OrganiClientCompositeId> getRepository() {
    return organiClientRepository;
  }

  @Override
  protected Function<OrganiClientEntity, OrganiClient> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<OrganiClient, OrganiClientEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<OrganiClient> findAll() {
    return organiClientRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
}
