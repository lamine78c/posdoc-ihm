package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.CompositionRepository;
import fr.acoss.posdoc.database.entities.CompositionEntity;
import fr.acoss.posdoc.database.mappers.CompositionMapper;
import fr.acoss.posdoc.domain.composition.model.Composition;
import fr.acoss.posdoc.domain.composition.secondary.CompositionPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CompositionPersistenceImpl
    extends AbstractObjectPersistence<CompositionEntity, String, Composition>
    implements CompositionPersistence {

  private static final CompositionMapper COMPOSITION_MAPPER = CompositionMapper.INSTANCE;

  private final CompositionRepository compositionRepository;

  public CompositionPersistenceImpl(CompositionRepository compositionRepository) {
    this.compositionRepository = compositionRepository;
  }

  @Override
  protected JpaSpecificationExecutor<CompositionEntity> getSpecificationExecutor() {
    return compositionRepository;
  }

  @Override
  protected JpaRepository<CompositionEntity, String> getRepository() {
    return compositionRepository;
  }

  @Override
  protected Function<CompositionEntity, Composition> entityToDomainFunction() {
    return COMPOSITION_MAPPER::entityToDomain;
  }

  @Override
  protected Function<Composition, CompositionEntity> domainToEntityFunction() {
    return COMPOSITION_MAPPER::domainToEntity;
  }

  @Override
  public List<Composition> selectAll() {
    return compositionRepository.selectAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    compositionRepository.deleteByCodeIn(ids);
  }

}
