package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenlieEntity;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface GenLieRepository extends GenericRepository<GenlieEntity, Integer> {

    @QueryLog(entity = "GenlieEntity", action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM GenlieEntity gl " +
            "WHERE gl.idpere IN (" +
            "   SELECT ge.id FROM GenEtpEntity ge" +
            "   WHERE ge.codenv = :#{#query.codenv} " +
            "       AND ge.codorg = :#{#query.codorg} " +
            "       AND ge.codapp = :#{#query.codapp} " +
            "       AND ge.percod = :#{#query.percod}" +
            ")")
    void deleteGenliePere(@Param("query") DeleteBonTravailManuelQuery query);

    @QueryLog(entity = "GenlieEntity", action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM GenlieEntity gl " +
            "WHERE gl.idfils IN (" +
            "   SELECT ge.id FROM GenEtpEntity ge" +
            "   WHERE ge.codenv = :#{#query.codenv} " +
            "       AND ge.codorg = :#{#query.codorg} " +
            "       AND ge.codapp = :#{#query.codapp} " +
            "       AND ge.percod = :#{#query.percod}" +
            ")")
    void deleteGenlieFils(@Param("query") DeleteBonTravailManuelQuery query);
}
