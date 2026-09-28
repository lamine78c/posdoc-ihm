package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ImprimeRepository;
import fr.acoss.posdoc.database.entities.ImprimeEntity;
import fr.acoss.posdoc.database.mappers.ImprimeMapper;
import fr.acoss.posdoc.domain.imprime.model.Imprime;
import fr.acoss.posdoc.domain.imprime.secondary.ImprimePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ImprimePersistenceImpl
    extends AbstractObjectPersistence<ImprimeEntity, String, Imprime>
    implements ImprimePersistence {

  private static final ImprimeMapper MAPPER = ImprimeMapper.INSTANCE;

  private final ImprimeRepository imprimeRepository;

  public ImprimePersistenceImpl(
      final ImprimeRepository imprimeRepository
  ) {
    this.imprimeRepository = imprimeRepository;
  }

  @Override
  protected JpaSpecificationExecutor<ImprimeEntity> getSpecificationExecutor() {
    return imprimeRepository;
  }

  @Override
  protected JpaRepository<ImprimeEntity, String> getRepository() {
    return imprimeRepository;
  }

  @Override
  protected Function<ImprimeEntity, Imprime> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Imprime, ImprimeEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Imprime> selectAll() {
    return imprimeRepository.selectAll();
  }

  @Override
  public List<Imprime> findImprimesByEnvsAndApps(List<String> codesEnv, List<String> codesApp) {
    return imprimeRepository.findImprimesByEnvsAndApps(codesEnv, codesApp).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<String> compositionsExistsInImprime(List<String> compositionCodes) {
    return imprimeRepository.compositionsExistsInImprime(compositionCodes);
  }

  @Override
  public void deleteAll(List<String> ids) {
    imprimeRepository.deleteByReferenceIn(ids);
  }
}
