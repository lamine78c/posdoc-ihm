package fr.acoss.posdoc.database.dao;


import fr.acoss.posdoc.database.entities.RegionMappingEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionMappingRepository extends GenericRepository<RegionMappingEntity, String> {

    List<RegionMappingEntity> findByCodeAnaisIn(Iterable<String> codeAnais);

}
