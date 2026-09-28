package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.LotRefRepository;
import fr.acoss.posdoc.database.entities.LotRefEntity;
import fr.acoss.posdoc.database.mappers.LotRefMapper;
import fr.acoss.posdoc.domain.lotref.model.LotRef;
import fr.acoss.posdoc.domain.lotref.secondary.LotRefPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class LotRefPersistenceImpl
    extends AbstractObjectPersistence<LotRefEntity, String, LotRef>
    implements LotRefPersistence {

  private static final LotRefMapper MAPPER = LotRefMapper.INSTANCE;

  private final LotRefRepository lotRefRepository;

  public LotRefPersistenceImpl(final LotRefRepository lotRefRepository) {
    this.lotRefRepository = lotRefRepository;
  }

  @Override
  protected JpaSpecificationExecutor<LotRefEntity> getSpecificationExecutor() {
    return lotRefRepository;
  }

  @Override
  protected JpaRepository<LotRefEntity, String> getRepository() {
    return lotRefRepository;
  }

  @Override
  protected Function<LotRefEntity, LotRef> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<LotRef, LotRefEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

}
