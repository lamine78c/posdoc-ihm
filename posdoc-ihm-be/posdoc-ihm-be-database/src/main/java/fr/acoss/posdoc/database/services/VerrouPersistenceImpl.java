package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.VerrouRepository;
import fr.acoss.posdoc.database.entities.VerrouEntity;
import fr.acoss.posdoc.database.mappers.VerrouMapper;
import fr.acoss.posdoc.domain.verrou.model.Verrou;
import fr.acoss.posdoc.domain.verrou.secondary.VerrouPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class VerrouPersistenceImpl extends AbstractObjectPersistence<VerrouEntity, String, Verrou>
    implements VerrouPersistence {

  private static final VerrouMapper MAPPER = VerrouMapper.INSTANCE;

  private final VerrouRepository verrouRepository;

  public VerrouPersistenceImpl(
      VerrouRepository verrouRepository) {this.verrouRepository = verrouRepository;}

  @Override
  protected JpaSpecificationExecutor<VerrouEntity> getSpecificationExecutor() {
    return verrouRepository;
  }

  @Override
  protected JpaRepository<VerrouEntity, String> getRepository() {
    return verrouRepository;
  }

  @Override
  protected Function<VerrouEntity, Verrou> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Verrou, VerrouEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Verrou> selectAll() {
    return verrouRepository.findAllByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    verrouRepository.deleteByCodeIn(ids);
  }

}
