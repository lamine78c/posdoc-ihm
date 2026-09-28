package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.MultifRepository;
import fr.acoss.posdoc.database.entities.MultifEntity;
import fr.acoss.posdoc.database.mappers.MultifMapper;
import fr.acoss.posdoc.domain.multif.model.Multif;
import fr.acoss.posdoc.domain.multif.secondary.MultifPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MultifPersistenceImpl
    extends AbstractObjectPersistence<MultifEntity, String, Multif>
    implements MultifPersistence {

  private static final MultifMapper MULTIF_MAPPER = MultifMapper.INSTANCE;

  private final MultifRepository multifRepository;

  public MultifPersistenceImpl(MultifRepository multifRepository) {
    this.multifRepository = multifRepository;
  }

  @Override
  protected JpaSpecificationExecutor<MultifEntity> getSpecificationExecutor() {
    return multifRepository;
  }

  @Override
  protected JpaRepository<MultifEntity, String> getRepository() {
    return multifRepository;
  }

  @Override
  protected Function<MultifEntity, Multif> entityToDomainFunction() {
    return MULTIF_MAPPER::entityToDomain;
  }

  @Override
  protected Function<Multif, MultifEntity> domainToEntityFunction() {
    return MULTIF_MAPPER::domainToEntity;
  }

  @Override
  public List<Multif> selectAll() {
    return multifRepository.selectAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  public void deleteAll(Iterable<String> ids) {
    multifRepository.deleteByCodeIn(ids);
  }
}
