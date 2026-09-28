package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TransactionalReadOnly;
import fr.acoss.posdoc.database.TransactionalReadWrite;
import fr.acoss.posdoc.database.dao.EnvironnementRepository;
import fr.acoss.posdoc.database.entities.EnvironnementEntity;
import fr.acoss.posdoc.database.mappers.EnvironnementMapper;
import fr.acoss.posdoc.domain.environnement.model.Environnement;
import fr.acoss.posdoc.domain.environnement.secondary.EnvironnementPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EnvironnementPersistenceImpl
    extends AbstractObjectPersistence<EnvironnementEntity, String, Environnement>
    implements EnvironnementPersistence {

  private static final EnvironnementMapper MAPPER = EnvironnementMapper.INSTANCE;

  private final EnvironnementRepository environnementRepository;

  public EnvironnementPersistenceImpl(final EnvironnementRepository environnementRepository) {
    this.environnementRepository = environnementRepository;
  }

  @Override
  protected JpaSpecificationExecutor<EnvironnementEntity> getSpecificationExecutor() {
    return environnementRepository;
  }

  @Override
  protected JpaRepository<EnvironnementEntity, String> getRepository() {
    return environnementRepository;
  }

  @Override
  protected Function<EnvironnementEntity, Environnement> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Environnement, EnvironnementEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  @TransactionalReadOnly
  public List<Environnement> selectAll() {
    return environnementRepository.findAllByOrderByCodeAsc() ;
  }

  @Override
  @TransactionalReadOnly
  public List<Environnement> selectAllInApplication() {
    return environnementRepository.findAllInApplicationByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  @TransactionalReadOnly
  public List<Environnement> selectAllInFichier() {
    return environnementRepository.findAllInFichierByOrderByCodeAsc().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  @TransactionalReadWrite
  public void deleteAll(Iterable<String> ids) {
    environnementRepository.deleteByCodeIn(ids);
  }

  @Override
  @TransactionalReadOnly
  public List<String> findCodeEnv() {
      return environnementRepository.findCodeEnv();
  }
}
