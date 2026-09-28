package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.SiteOrganismeRepository;
import fr.acoss.posdoc.database.entities.SiteOrganismeEntity;
import fr.acoss.posdoc.database.mappers.SiteMapper;
import fr.acoss.posdoc.domain.site.model.SiteOrganisme;
import fr.acoss.posdoc.domain.site.secondary.SiteOrganismePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SiteOrganismePersistenceImpl
    extends AbstractObjectPersistence<SiteOrganismeEntity, String, SiteOrganisme>
    implements SiteOrganismePersistence {

  private static final SiteMapper MAPPER = SiteMapper.INSTANCE;

  private final SiteOrganismeRepository siteOrganismeRepository;

  public SiteOrganismePersistenceImpl(final SiteOrganismeRepository siteOrganismeRepository) {
    this.siteOrganismeRepository = siteOrganismeRepository;
  }

  @Override
  protected JpaSpecificationExecutor<SiteOrganismeEntity> getSpecificationExecutor() {
    return siteOrganismeRepository;
  }

  @Override
  protected JpaRepository<SiteOrganismeEntity, String> getRepository() {
    return siteOrganismeRepository;
  }

  @Override
  protected Function<SiteOrganismeEntity, SiteOrganisme> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<SiteOrganisme, SiteOrganismeEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<SiteOrganisme> selectAll() {
    return siteOrganismeRepository.findAll().stream()
            .map(MAPPER::entityToDomain)
            .collect(Collectors.toList());
  }
}
