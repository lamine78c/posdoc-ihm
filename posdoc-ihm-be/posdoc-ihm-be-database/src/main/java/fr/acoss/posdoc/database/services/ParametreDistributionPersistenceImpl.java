package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ParametreDistributionRepository;
import fr.acoss.posdoc.database.entities.ParametreDistributionEntity;
import fr.acoss.posdoc.database.mappers.ParametreDistributionMapper;
import fr.acoss.posdoc.domain.parametre.distribution.model.ParametreDistribution;
import fr.acoss.posdoc.domain.parametre.distribution.secondary.ParametreDistributionPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ParametreDistributionPersistenceImpl
    extends AbstractObjectPersistence<ParametreDistributionEntity, String, ParametreDistribution>
    implements ParametreDistributionPersistence {

  private static final ParametreDistributionMapper MAPPER = ParametreDistributionMapper.INSTANCE;

  private final ParametreDistributionRepository parametreDistributionRepository;

  public ParametreDistributionPersistenceImpl(
      ParametreDistributionRepository parametreDistributionRepository) {this.parametreDistributionRepository = parametreDistributionRepository;}

  @Override
  protected JpaSpecificationExecutor<ParametreDistributionEntity> getSpecificationExecutor() {
    return parametreDistributionRepository;
  }

  @Override
  protected JpaRepository<ParametreDistributionEntity, String> getRepository() {
    return parametreDistributionRepository;
  }

  @Override
  protected Function<ParametreDistributionEntity, ParametreDistribution> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<ParametreDistribution, ParametreDistributionEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<ParametreDistribution> selectAll() {
    return parametreDistributionRepository.findAllByOrderByReferenceAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    parametreDistributionRepository.deleteByReferenceIn(ids);
  }

}
