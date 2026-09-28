package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ComposEntity;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComposRepository
    extends GenericRepository<ComposEntity, String>, JpaSpecificationExecutor<ComposEntity> {

    Optional<ComposEntity> findComposEntityByTypmef(String typmef);
}
