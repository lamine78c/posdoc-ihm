package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenNotCompositeId;
import fr.acoss.posdoc.database.entities.GenNotEntity;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface GenNotRepository extends GenericRepository<GenNotEntity, GenNotCompositeId> {

    @Transactional
    void deleteAllByIdIn(final List<GenNotCompositeId> ids);

    @QueryLog(entity = "GenNotEntity", action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query("DELETE FROM GenNotEntity gn " +
            "WHERE gn.id.codenv = :#{#query.codenv} " +
            "   AND gn.id.codorg = :#{#query.codorg} " +
            "   AND gn.id.codapp = :#{#query.codapp} " +
            "   AND gn.id.percod = :#{#query.percod} " +
            "   AND gn.id.numcom = :#{#query.numcom} " +
            "   AND gn.id.codcom = :#{#query.codcom} " +
            "   AND gn.id.codfic = :#{#query.codfic}")
    void deleteGennot(@Param("query") DeleteBonTravailManuelQuery query);
}
