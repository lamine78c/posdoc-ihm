package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.NotficEntity;
import fr.acoss.posdoc.domain.notfic.model.FindNoticeDetailsByFichierPayload;
import fr.acoss.posdoc.domain.notfic.model.NotFicCompositeId;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.notfic.model.SearchNoticesFichiersPayload;
import fr.acoss.posdoc.domain.notfic.model.UpdateNotficsPayload;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
public interface NotficRepository extends GenericRepository<NotficEntity, String> {

    @Query("SELECT " +
            "   n.id.codenv as codenv, " +
            "   n.id.codorg as codorg, " +
            "   n.id.codapp as codapp, " +
            "   n.id.codcom as codcom, " +
            "   n.id.codfic as codfic, " +
            "   f.codeProd as codprd, " +
            "   f.refImprime as refimp, " +
            "   CAST(n.dnotid as string) as dnotid, " +
            "   CAST(n.dnotit as string) as dnotit, " +
            "   CAST(n.maxnot as string) as maxnot " +
            "FROM NotficEntity n " +
            "JOIN FichierEntity f ON " +
            "   n.id.codenv = f.id.codeEnv AND " +
            "   n.id.codorg = f.id.codeOrg AND " +
            "   n.id.codapp = f.id.codeApp AND " +
            "   n.id.codcom = f.id.codeCom AND " +
            "   n.id.codfic = f.id.codeFich " +
            "WHERE n.id.codnot = :#{#query.codnot} " +
            "AND n.id.codapp <> 'MAS' " +
            "AND (:#{#query.codenv} IS NULL OR n.id.codenv = :#{#query.codenv}) " +
            "AND ((:#{#query.codorg}) IS NULL OR n.id.codorg IN :#{#query.codorg}) " +
            "AND (:#{#query.codapp} IS NULL OR n.id.codapp = :#{#query.codapp}) " +
            "AND (:#{#query.codcom} IS NULL OR n.id.codcom LIKE :#{#query.codcom}) " +
            "AND ((:#{#query.codfic}) IS NULL OR n.id.codfic IN :#{#query.codfic}) " +
            "AND (:#{#query.refimp} IS NULL OR f.refImprime LIKE :#{#query.refimp}) " +
            "ORDER BY codenv, codorg, codapp, codcom, codfic")
    List<Map<String, String>> findNotficWithFichie(@Param("query") SearchNotficQuery query);

    @Query(value = "SELECT " +
            "   n.c27_codenv as codenv, " +
            "   n.c27_codorg as codorg, " +
            "   n.c27_codapp as codapp, " +
            "   n.c27_codcom as codcom, " +
            "   n.c27_codfic as codfic, " +
            "   f.s07_codprd as codprd, " +
            "   f.s07_refimp as refimp, " +
            "   STRING_AGG(DISTINCT n.c27_codnot, ',' ORDER BY n.c27_codnot) as notices " +
            "FROM notfic n " +
            "JOIN fichie f ON " +
            "   n.c27_codenv = f.c07_codenv AND " +
            "   n.c27_codorg = f.c07_codorg AND " +
            "   n.c27_codapp = f.c07_codapp AND " +
            "   n.c27_codcom = f.c07_codcom AND " +
            "   n.c27_codfic = f.c07_codfic " +
            "WHERE n.c27_codapp <> :masapp " +
            "AND (CAST(:#{#payload.codenv} AS VARCHAR) IS NULL OR n.c27_codenv = CAST(:#{#payload.codenv} AS VARCHAR)) " +
            "AND (:#{#payload.codorg != null && !#payload.codorg.isEmpty()} = false OR n.c27_codorg IN :#{#payload.codorg}) " +
            "AND (CAST(:#{#payload.codapp} AS VARCHAR) IS NULL OR n.c27_codapp = CAST(:#{#payload.codapp} AS VARCHAR)) " +
            "AND (CAST(:#{#payload.codcom} AS VARCHAR) IS NULL OR n.c27_codcom LIKE CAST(:#{#payload.codcom} AS VARCHAR)) " +
            "AND (:#{#payload.codfic != null && !#payload.codfic.isEmpty()} = false OR n.c27_codfic IN :#{#payload.codfic}) " +
            "AND (CAST(:#{#payload.refimp} AS VARCHAR) IS NULL OR f.s07_refimp LIKE CAST(:#{#payload.refimp} AS VARCHAR)) " +
            "GROUP BY n.c27_codenv, n.c27_codorg, n.c27_codapp, n.c27_codcom, n.c27_codfic, f.s07_codprd, f.s07_refimp " +
            "ORDER BY codenv, codorg, codapp, codcom, codfic",
            nativeQuery = true)
    List<Map<String, String>> findNoticesFichiers(@Param("payload") SearchNoticesFichiersPayload payload, @Param("masapp") String masapp);

    @Query(value = "SELECT " +
            "   notice.c26_codnot as codeNotice, " +
            "   notice.s26_fornot as format, " +
            "   notice.n26_poinot as poids, " +
            "   CONCAT_WS('-', notice.s26_pornot, notice.s26_codsit) as portee, " +
            "   notfic.d27_dnotid as dateDebut, " +
            "   notfic.d27_dnotit as dateFin " +
            "FROM notfic " +
            "JOIN notice ON notfic.c27_codnot = notice.c26_codnot " +
            "WHERE notfic.c27_codenv = :#{#payload.codenv} " +
            "AND notfic.c27_codorg = :#{#payload.codorg} " +
            "AND notfic.c27_codapp = :#{#payload.codapp} " +
            "AND notfic.c27_codcom = :#{#payload.codcom} " +
            "AND notfic.c27_codfic = :#{#payload.codfic} " +
            "ORDER BY notice.c26_codnot",
            nativeQuery = true)
    List<Map<String, Object>> findNoticeDetailsByFichier(@Param("payload") FindNoticeDetailsByFichierPayload payload);

    @QueryLog(entity = "NotficEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE NotficEntity n " +
            "SET n.dnotid = :dnotid, n.dnotit = :dnotit " +
            "WHERE n.id.codenv = :#{#query.codenv} " +
            "AND n.id.codorg = :#{#query.codorg} " +
            "AND n.id.codapp = :#{#query.codapp} " +
            "AND n.id.codcom = :#{#query.codcom} " +
            "AND n.id.codfic = :#{#query.codfic} " +
            "AND n.id.codnot = :#{#query.codnot} ")
    void updateNotfic(
            @Param("query") UpdateNotficsPayload query,
            @Param("dnotid") Date dnotid,
            @Param("dnotit") Date dnotit
    );

    @QueryLog(entity = "NotficEntity", action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query("DELETE FROM NotficEntity n " +
            "WHERE n.id.codenv = :#{#query.codenv} " +
            "AND n.id.codorg = :#{#query.codorg} " +
            "AND n.id.codapp = :#{#query.codapp} " +
            "AND n.id.codcom = :#{#query.codcom} " +
            "AND n.id.codfic = :#{#query.codfic} " +
            "AND n.id.codnot = :#{#query.codnot}")
    void deleteNotfic(@Param("query") NotFicCompositeId query);

    @Query("SELECT CASE WHEN (COUNT(n) > 0) THEN false ELSE true END" +
            " FROM NotficEntity n " +
            " WHERE n.id.codenv = :#{#query.codenv} " +
            " AND n.id.codorg = :#{#query.codorg} " +
            " AND n.id.codapp = :#{#query.codapp} " +
            " AND n.id.codcom = :#{#query.codcom} " +
            " AND n.id.codfic = :#{#query.codfic} " +
            " AND n.id.codnot = :#{#query.codnot} "
    )
    boolean isNotExistByCompositeId(@Param("query") NotFicCompositeId query);
}
