package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ColimpEntity;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ColimpRepository
    extends GenericRepository<ColimpEntity, String>, JpaSpecificationExecutor<ColimpEntity> {

    Optional<ColimpEntity> findColimpEntityByTypcol(String typcol);
}
