package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQueryDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UtiLogRepository extends GenericRepository<UtiLogEntity, Integer> {

    List<UtiLogEntity> findUtiLogEntitiesByDatuloBetween(LocalDateTime datuloAfter, LocalDateTime datuloBefore);

    @Query( " SELECT DISTINCT(u.codusr) as user " +
            " FROM UtiLogEntity u" +
            " ORDER BY u.codusr ASC "
    )
    List<String> findDistinctUser();

    @Query( " SELECT DISTINCT(u.action) as action " +
            " FROM UtiLogEntity u" +
            " ORDER BY u.action ASC "
    )
    List<String> findDistinctAction();

    @Query( " SELECT DISTINCT(u.formid) as formid " +
            " FROM UtiLogEntity u" +
            " ORDER BY u.formid ASC "
    )
    List<String> findDistinctFormId();

    @Query( " SELECT u " +
            " FROM UtiLogEntity u " +
            " WHERE u.datulo BETWEEN :#{#query.dtdeb} AND :#{#query.dtfin} " +
            " AND ( (:#{#query.result}) IS NULL OR u.result = (:#{#query.result}) ) " +
            " AND ( (:#{#query.user}) IS NULL OR u.codusr = (:#{#query.user}) ) " +
            " AND ( (:#{#query.action}) IS NULL OR u.action = (:#{#query.action}) ) " +
            " AND ( (:#{#query.form}) IS NULL OR u.formid = (:#{#query.form}) ) " +
            " ORDER BY u.datulo desc "
    )
    List<UtiLogEntity> findUtiLogByQuery(@Param("query") FindUtiLogByQueryDateTime query);

    @Query(value = "SELECT u.c69_codulo FROM utilog u LEFT JOIN myslog m ON u.c69_codulo = m.s37_codulo " +
            " WHERE u.d69_datulo <= :dateLimit AND m.s37_codulo is null ORDER BY u.d69_datulo ASC", nativeQuery = true)
    List<Integer> findRowNotInMyslogToPurge(@Param("dateLimit") LocalDateTime dateLimit, Pageable pageable);

    @Transactional
    void deleteByCoduloIn(Iterable<Integer> codulos);
}
