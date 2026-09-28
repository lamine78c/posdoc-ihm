package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.SupportRepository;
import fr.acoss.posdoc.database.entities.SupportEntity;
import fr.acoss.posdoc.database.mappers.SupportMapper;
import fr.acoss.posdoc.domain.support.model.Support;
import fr.acoss.posdoc.domain.support.secondary.SupportPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SupportPersistenceImpl
    extends AbstractObjectPersistence<SupportEntity, String, Support>
    implements SupportPersistence {

  private static final SupportMapper MAPPER = SupportMapper.INSTANCE;

  private final SupportRepository supportRepository;

  public SupportPersistenceImpl(
      SupportRepository supportRepository) {this.supportRepository = supportRepository;}

  @Override
  protected JpaSpecificationExecutor<SupportEntity> getSpecificationExecutor() {
    return supportRepository;
  }

  @Override
  protected JpaRepository<SupportEntity, String> getRepository() {
    return supportRepository;
  }

  @Override
  protected Function<SupportEntity, Support> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Support, SupportEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Support> selectAll() {
    return supportRepository.selectAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    supportRepository.deleteByTypeIn(ids);
  }

}
