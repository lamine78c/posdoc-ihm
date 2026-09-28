package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.JobLockEntity;
import fr.acoss.posdoc.domain.joblock.model.JobLock;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface JobLockMapper {

  JobLockMapper INSTANCE = Mappers.getMapper(JobLockMapper.class);

  JobLock entityToDomain(final JobLockEntity jobLockEntity);

  JobLockEntity domainToEntity(final JobLock jobLock);

}
