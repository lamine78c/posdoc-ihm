package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.HisProRepository;
import fr.acoss.posdoc.database.entities.HisProCompositeId;
import fr.acoss.posdoc.database.entities.HisProEntity;
import fr.acoss.posdoc.database.mappers.HisProMapper;
import fr.acoss.posdoc.domain.hispro.model.HisPro;
import fr.acoss.posdoc.domain.hispro.secondary.HisProPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class HisProPersistenceImpl extends AbstractObjectPersistence<HisProEntity, HisProCompositeId, HisPro>
    implements HisProPersistence {

  private static final HisProMapper MAPPER = HisProMapper.INSTANCE;

  private final HisProRepository hisProRepository;

  public HisProPersistenceImpl(final HisProRepository hisProRepository) {
    this.hisProRepository = hisProRepository;
  }

  @Override
  protected JpaSpecificationExecutor<HisProEntity> getSpecificationExecutor() {
    return hisProRepository;
  }

  @Override
  protected JpaRepository<HisProEntity, HisProCompositeId> getRepository() {
    return hisProRepository;
  }

  @Override
  protected Function<HisProEntity, HisPro> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<HisPro, HisProEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

}
