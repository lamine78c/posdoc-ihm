package fr.acoss.posdoc.database.mappers;


import fr.acoss.posdoc.database.entities.RegionMappingEntity;
import fr.acoss.posdoc.domain.regionmapping.model.RegionMapping;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface RegionMappingMapper {

    RegionMappingMapper INSTANCE = Mappers.getMapper(RegionMappingMapper.class);

    RegionMapping entityToDomain(final RegionMappingEntity regionMappingEntity);

    RegionMappingEntity domainToEntity(final RegionMapping regionMapping);
}
