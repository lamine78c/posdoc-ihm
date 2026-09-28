package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.RegionEntity;
import fr.acoss.posdoc.domain.region.model.Region;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface RegionMapper {

  RegionMapper INSTANCE = Mappers.getMapper(RegionMapper.class);

  Region entityToDomain(final RegionEntity regionEntity);

  RegionEntity domainToEntity(final Region region);

}
