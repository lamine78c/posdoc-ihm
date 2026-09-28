package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.HisProCompositeId;
import fr.acoss.posdoc.database.entities.HisProEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface HisProRepository extends GenericRepository<HisProEntity, HisProCompositeId> {

}
