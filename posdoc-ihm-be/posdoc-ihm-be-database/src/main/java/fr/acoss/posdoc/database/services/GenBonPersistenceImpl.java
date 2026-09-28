package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.GenBonRepository;
import fr.acoss.posdoc.database.entities.GenBonEntity;
import fr.acoss.posdoc.database.mappers.GenBonMapper;
import fr.acoss.posdoc.domain.genbon.model.GenBon;
import fr.acoss.posdoc.domain.genbon.secondary.GenBonPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class GenBonPersistenceImpl extends AbstractObjectPersistence<GenBonEntity, String, GenBon>
    implements GenBonPersistence {
  private static final GenBonMapper MAPPER = GenBonMapper.INSTANCE;
  private final GenBonRepository genBonRepository;

  public GenBonPersistenceImpl(
    final GenBonRepository genBonRepository
  ) {
    this.genBonRepository = genBonRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GenBonEntity> getSpecificationExecutor() {
    return genBonRepository;
  }

  @Override
  protected JpaRepository<GenBonEntity, String> getRepository() {
    return genBonRepository;
  }

  @Override
  protected Function<GenBonEntity, GenBon> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<GenBon, GenBonEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

}
