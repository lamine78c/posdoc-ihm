package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.SiteCNPRepository;
import fr.acoss.posdoc.database.entities.SiteCNPEntity;
import fr.acoss.posdoc.database.mappers.SiteMapper;
import fr.acoss.posdoc.domain.site.model.SiteCNP;
import fr.acoss.posdoc.domain.site.secondary.SiteCNPPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SiteCNPPersistenceImpl
    extends AbstractObjectPersistence<SiteCNPEntity, String, SiteCNP>
    implements SiteCNPPersistence {

  private static final SiteMapper MAPPER = SiteMapper.INSTANCE;

  private final SiteCNPRepository siteCNPRepository;

  public SiteCNPPersistenceImpl(
      SiteCNPRepository siteCNPRepository) {this.siteCNPRepository = siteCNPRepository;}

  @Override
  protected JpaSpecificationExecutor<SiteCNPEntity> getSpecificationExecutor() {
    return siteCNPRepository;
  }

  @Override
  protected JpaRepository<SiteCNPEntity, String> getRepository() {
    return siteCNPRepository;
  }

  @Override
  protected Function<SiteCNPEntity, SiteCNP> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<SiteCNP, SiteCNPEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<SiteCNP> selectAll() {
    return siteCNPRepository.findAllByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    siteCNPRepository.deleteByCodeIn(ids);
  }

  @Override
  public SiteCNP findById(String code) {
    Optional<SiteCNPEntity> siteCNP = siteCNPRepository.findById(code);
    return siteCNP.map(siteCNPEntity -> entityToDomainFunction().apply(siteCNPEntity)).orElse(null);
  }

  @Override
  public List<String> findAllMasOrgs() {
    return siteCNPRepository.findAllMasOrgs();
  }
}
