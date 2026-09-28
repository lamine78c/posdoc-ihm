package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.RegionRepository;
import fr.acoss.posdoc.database.entities.RegionEntity;
import fr.acoss.posdoc.database.mappers.RegionMapper;
import fr.acoss.posdoc.domain.region.model.Region;
import fr.acoss.posdoc.domain.region.secondary.RegionPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RegionPersistenceImpl extends AbstractObjectPersistence<RegionEntity, String, Region>
    implements RegionPersistence {

  private static final RegionMapper MAPPER = RegionMapper.INSTANCE;

  private final RegionRepository regionRepository;

  public RegionPersistenceImpl(
      RegionRepository regionRepository) {this.regionRepository = regionRepository;}

  @Override
  protected JpaSpecificationExecutor<RegionEntity> getSpecificationExecutor() {
    return regionRepository;
  }

  @Override
  protected JpaRepository<RegionEntity, String> getRepository() {
    return regionRepository;
  }

  @Override
  protected Function<RegionEntity, Region> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Region, RegionEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    regionRepository.deleteByCodeIn(ids);
  }

  @Override
  public List<Region> updateAll(List<Region> regions) {
    var entity = regions.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return regionRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<Region> selectAll() {
    return regionRepository.findAllByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

}
