package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.JobLockRepository;
import fr.acoss.posdoc.database.entities.JobLockEntity;
import fr.acoss.posdoc.database.mappers.JobLockMapper;
import fr.acoss.posdoc.domain.joblock.model.JobLock;
import fr.acoss.posdoc.domain.joblock.secondary.JobLockPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.function.Function;

@Service
public class JobLockPersistenceImpl
    extends AbstractObjectPersistence<JobLockEntity, String, JobLock>
    implements JobLockPersistence {

  private static final JobLockMapper MAPPER = JobLockMapper.INSTANCE;

  private static final Logger LOGGER = LoggerFactory.getLogger(JobLockPersistenceImpl.class);

  private final JobLockRepository jobLockRepository;

  public JobLockPersistenceImpl(final JobLockRepository jobLockRepository) {
    this.jobLockRepository = jobLockRepository;
  }

  @Override
  protected JpaSpecificationExecutor<JobLockEntity> getSpecificationExecutor() {
    return jobLockRepository;
  }

  @Override
  protected JpaRepository<JobLockEntity, String> getRepository() {
    return jobLockRepository;
  }

  @Override
  protected Function<JobLockEntity, JobLock> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<JobLock, JobLockEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public void unlockForce(String name, int days) {
    LocalDateTime dateLimit = LocalDateTime.now().minusDays(days);
    if(jobLockRepository.existsLockToForceUnlock(name, dateLimit)) {
      jobLockRepository.unlockForce(name, dateLimit);
      LOGGER.info("{} a été supprimé de manière forcée", name);
    }
  }

  @Override
  public boolean existsById(String id) {
    return jobLockRepository.existsById(id);
  }
}
