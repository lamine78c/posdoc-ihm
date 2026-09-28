package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.OrganismeRepository;
import fr.acoss.posdoc.database.entities.OrganismeEntity;
import fr.acoss.posdoc.database.mappers.OrganismeMapper;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrganismePersistenceImpl
    extends AbstractObjectPersistence<OrganismeEntity, String, Organisme>
    implements OrganismePersistence {

  private static final OrganismeMapper ORG_MAPPER = OrganismeMapper.INSTANCE;

  private final OrganismeRepository organismeRepository;

  public OrganismePersistenceImpl(OrganismeRepository organismeRepository) {
    this.organismeRepository = organismeRepository;
  }

  @Override
  protected JpaSpecificationExecutor<OrganismeEntity> getSpecificationExecutor() {
    return organismeRepository;
  }

  @Override
  protected JpaRepository<OrganismeEntity, String> getRepository() {
    return organismeRepository;
  }

  @Override
  protected Function<OrganismeEntity, Organisme> entityToDomainFunction() {
    return ORG_MAPPER::entityToDomain;
  }

  @Override
  protected Function<Organisme, OrganismeEntity> domainToEntityFunction() {
    return ORG_MAPPER::domainToEntity;
  }

  @Override
  public List<Organisme> selectAll() {
    return organismeRepository.findOrganismes().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public Organisme findById(String code) {
    Optional<OrganismeEntity> oe = organismeRepository.findById(code);
    if(oe.isPresent()){
      return entityToDomainFunction().apply(oe.get());
    }else {
      return new Organisme();
    }
  }

  @Override
  public List<Organisme> findAllOrganismes() {
    return selectAll();
  }

  @Override
  public List<Organisme> organismesByRegions(List<String> regions) {
    var res = this.organismeRepository.findByCodeRegionIn(regions);
    return res.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<String> codesOrganismesByRegions(List<String> regions){
    return this.organismeRepository.findCodeOrganismeByRegionAnais(regions);
  }

  @Override
  public void deleteAll(Iterable<String> codes) {
    organismeRepository.deleteByCodeIn(codes);
  }

  @Override
  public List<String> regionsExistsInOrganismes(List<String> regionCodes) {
    return organismeRepository.regionsExistsInOrganismes(regionCodes);
  }

  @Override
  public List<String> sitesExistsInOrganismes(List<String> siteCodes) {
    return organismeRepository.sitesExistsInOrganismes(siteCodes);
  }

  @Override
  public List<String> findCodeOrganismesByTypeR() {
      return organismeRepository.findCodeOrganismesByTypeR();
  }
}
