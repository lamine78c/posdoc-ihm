package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ColimpRepository;
import fr.acoss.posdoc.database.entities.ColimpEntity;
import fr.acoss.posdoc.database.mappers.ColimpMapper;
import fr.acoss.posdoc.domain.colimp.model.Colimp;
import fr.acoss.posdoc.domain.colimp.secondary.ColimpPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ColimpPersistenceImpl
    extends AbstractObjectPersistence<ColimpEntity, String, Colimp>
    implements ColimpPersistence {

  private static final ColimpMapper MAPPER = ColimpMapper.INSTANCE;

  private final ColimpRepository colimpRepository;

  public ColimpPersistenceImpl(
      ColimpRepository colimpRepository
  ) {
    this.colimpRepository = colimpRepository;
  }

  @Override
  protected JpaSpecificationExecutor<ColimpEntity> getSpecificationExecutor() {
    return colimpRepository;
  }

  @Override
  protected JpaRepository<ColimpEntity, String> getRepository() {
    return colimpRepository;
  }

  @Override
  protected Function<ColimpEntity, Colimp> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Colimp, ColimpEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Colimp> selectAll() {
    return colimpRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
}
