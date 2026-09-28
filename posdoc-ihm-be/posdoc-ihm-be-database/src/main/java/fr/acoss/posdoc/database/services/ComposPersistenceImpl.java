package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ComposRepository;
import fr.acoss.posdoc.database.entities.ComposEntity;
import fr.acoss.posdoc.database.mappers.ComposMapper;
import fr.acoss.posdoc.domain.compos.model.Compos;
import fr.acoss.posdoc.domain.compos.secondary.ComposPersistence;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ComposPersistenceImpl
    extends AbstractObjectPersistence<ComposEntity, String, Compos>
    implements ComposPersistence {

  private static final ComposMapper MAPPER = ComposMapper.INSTANCE;

  private final ComposRepository composRepository;

  public ComposPersistenceImpl(
      ComposRepository composRepository
  ) {
    this.composRepository = composRepository;
  }

  @Override
  protected JpaSpecificationExecutor<ComposEntity> getSpecificationExecutor() {
    return composRepository;
  }

  @Override
  protected JpaRepository<ComposEntity, String> getRepository() {
    return composRepository;
  }

  @Override
  protected Function<ComposEntity, Compos> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Compos, ComposEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Compos> selectAll() {
    return composRepository.findAll(Sort.by(Sort.Direction.ASC, "libmef")).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
}
