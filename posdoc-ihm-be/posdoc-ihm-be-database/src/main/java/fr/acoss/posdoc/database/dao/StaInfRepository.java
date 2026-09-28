package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.StaInfCompositeId;
import fr.acoss.posdoc.database.entities.StaInfEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface StaInfRepository extends GenericRepository<StaInfEntity, StaInfCompositeId> {

}
