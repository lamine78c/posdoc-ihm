package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.GammeRepository;
import fr.acoss.posdoc.database.entities.GammeEntity;
import fr.acoss.posdoc.database.mappers.GammeMapper;
import fr.acoss.posdoc.domain.gammes.model.Gamme;
import fr.acoss.posdoc.domain.gammes.secondary.GammePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GammePersistenceImpl extends AbstractObjectPersistence<GammeEntity, String, Gamme>
    implements GammePersistence {

  private static final GammeMapper MAPPER = GammeMapper.INSTANCE;

  private final GammeRepository gammeRepository;

  public GammePersistenceImpl(
      GammeRepository gammeRepository) {this.gammeRepository = gammeRepository;}

  @Override
  protected JpaSpecificationExecutor<GammeEntity> getSpecificationExecutor() {
    return gammeRepository;
  }

  @Override
  protected JpaRepository<GammeEntity, String> getRepository() {
    return gammeRepository;
  }

  @Override
  protected Function<GammeEntity, Gamme> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Gamme, GammeEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Gamme> selectAll() {
    return gammeRepository.findAllByOrderByCodeAsc();
  }

  @Override
  public void deleteAll(List<String> ids) {
    gammeRepository.deleteAllByCodeIn(ids);
  }

  @Override
  public List<Gamme> updateAll(List<Gamme> gammes) {
    var entity = gammes.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return gammeRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<String> existsVerrous( List<String> codes) {
    return gammeRepository.existsVerrous(codes);
  }
}
