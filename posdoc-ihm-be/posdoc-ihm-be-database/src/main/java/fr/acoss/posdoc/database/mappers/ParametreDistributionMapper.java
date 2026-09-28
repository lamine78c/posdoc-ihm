package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ParametreDistributionEntity;
import fr.acoss.posdoc.domain.parametre.distribution.model.ParametreDistribution;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreDistributionMapper {

  ParametreDistributionMapper INSTANCE = Mappers.getMapper(ParametreDistributionMapper.class);

  ParametreDistribution entityToDomain(final ParametreDistributionEntity param);

  ParametreDistributionEntity domainToEntity(
      final ParametreDistribution parametreDistribution);
}
