package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenEtpEntity;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.genetp.model.DistinctCodenvCodorgCodappGenetp;
import fr.acoss.posdoc.domain.genetp.model.EnvOrgsQuery;
import fr.acoss.posdoc.domain.genetp.model.FirstVideoStep;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapePayload;
import fr.acoss.posdoc.domain.genetp.model.VideoStep;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpEnvOrgAppPercodQuery;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpExistsQuery;
import fr.acoss.posdoc.types.GenEtpType;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static fr.acoss.posdoc.types.CodeInformation.CODINF_0;
import static fr.acoss.posdoc.types.Statut.CREE;
import static fr.acoss.posdoc.types.Statut.DEBUTE;
import static fr.acoss.posdoc.types.Statut.INVALIDE;
import static fr.acoss.posdoc.types.Statut.SUSPENDU;
import static fr.acoss.posdoc.types.Statut.TERMINE;
import static fr.acoss.posdoc.types.Statut.VALIDE;
import static fr.acoss.posdoc.types.Constantes.STEPNO_0;
import static fr.acoss.posdoc.types.TypeEtape.TYPETP_BIL;
import static fr.acoss.posdoc.types.TypeEtape.TYPETP_DEB;
import static fr.acoss.posdoc.types.TypeEtape.TYPETP_DIS;
import static fr.acoss.posdoc.types.TypeEtape.TYPETP_FAB;
import static fr.acoss.posdoc.types.TypeEtape.TYPETP_MSP;

@Repository
public interface GenEtpRepository extends GenericRepository<GenEtpEntity, Integer> {
    String QUERY_UPDATE_GENETP_INVALIDATE =
            "UPDATE GenEtpEntity genetp " +
                    "SET genetp.statut = '" + INVALIDE + "', " +
                    "    genetp.invali = now()," +
                    "    genetp.codinf = 1 ";

    @Query( " SELECT  DISTINCT ge.codorg " +
            " from GenEtpEntity ge " +
            " where ge.typetp = '"+TYPETP_DIS+"' AND ge.reedit = 0 " +
            " and ( cast(:fromDate as date) IS NULL OR cast(:toDate as date) IS NULL OR ge.debute BETWEEN (:fromDate) and (:toDate) ) " +
            " and ge.codenv = (:codeEnv)"
    )
    List<String> organismeByEnvInterval(@Param("codeEnv") String env, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query( " SELECT  DISTINCT ge.codgam as codgam, ge.codres as codres, ge.codsit as codsit " +
            " from GenEtpEntity ge " +
            " where ge.typetp = '"+TYPETP_DIS+"' AND ge.reedit = 0 " +
            " and ge.codenv = (:#{#query.codeEnv})" +
            " and ( ge.codorg IN (:#{#query.codesOrg}) ) " +
            " order by ge.codgam, ge.codres, ge.codsit"
    )
    List<Map<String, String>> getGamSitResByEnvOrgs(@Param("query") EnvOrgsQuery query);

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenEtpEntity genetp SET " +
            " genetp.statut = '"+TERMINE+"', " +
            " genetp.codinf = '1', " +
            " genetp.termin = now() " +
            " WHERE " +
            " genetp.codenv = :codenv AND " +
            " genetp.codorg = :codorg AND " +
            " genetp.codapp = :codapp AND " +
            " genetp.percod = :percod")
    void termineGenEtp(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod
    );

    String QUERY_SELECT_FROM_GENETP = "SELECT new fr.acoss.posdoc.domain.genetp.model.GenEtp(ge.id, ge.typetp, ge.codenv, ge.codorg, ge.codapp, ge.percod, ge.codcom, " +
            "ge.numcom, ge.codfic, ge.codgam, ge.numexe, ge.codres, ge.codsit, ge.coddes, ge.nbrexe, ge.codser, ge.codsig, " +
            "ge.signal, ge.reedit, ge.fabsim, ge.statut, ge.codinf, ge.create, ge.valide, ge.debute, ge.termin, ge.invali, ge.suspen, ge.histor," +
            "ge.script, ge.stepno, ge.numpid, ge.etpfus, ge.clefus, ge.idtfus) " +
            " FROM GenEtpEntity ge " +
            " WHERE (:#{#query.codenv} IS NULL OR ge.codenv = :#{#query.codenv}) AND ((:#{#query.codorg}) IS NULL OR ge.codorg IN (:#{#query.codorg})) " +
            " AND (:#{#query.codapp} IS NULL OR ge.codapp = :#{#query.codapp}) AND (:#{#query.percod} IS NULL OR ge.percod = :#{#query.percod}) " +
            " AND (:#{#query.codcom} IS NULL OR ge.codcom = :#{#query.codcom}) AND (:#{#query.codfic} IS NULL OR ge.codfic = :#{#query.codfic}) " +
            " AND (:#{#query.codgam} IS NULL OR ge.codgam = :#{#query.codgam}) AND (:#{#query.codsit} IS NULL OR ge.codsit = :#{#query.codsit}) " +
            " AND (:#{#query.codres} IS NULL OR ge.codres = :#{#query.codres}) AND (:#{#query.codser} IS NULL OR ge.codser = :#{#query.codser}) " +
            " AND (ge.typetp IN :typetp) AND (:#{#query.statut} IS NULL OR ge.statut = :#{#query.statut}) " +
            " AND (:#{#query.codver} IS NULL OR (ge.statut = '"+DEBUTE+"' AND ge.typetp = '"+TYPETP_FAB+"' " +
            " AND ge.codgam IN (SELECT g.code FROM GammeEntity g WHERE g.codeVerrou = :#{#query.codver}))) ";

    String QUERY_ADD_DATDEB_DATFIN = " AND (:#{#query.typdat} IS NULL OR " +
            "   ((:datdeb IS NOT NULL AND :datfin IS NOT NULL) AND " +
            "   ((:#{#query.typdat} = 'Création' AND ge.create >= TO_TIMESTAMP(:datdeb, 'YYYY-MM-DD HH24:MI:SS') AND ge.create <= TO_TIMESTAMP(:datfin, 'YYYY-MM-DD HH24:MI:SS')) OR " +
            "    (:#{#query.typdat} = 'Validation' AND ge.valide >= TO_TIMESTAMP(:datdeb, 'YYYY-MM-DD HH24:MI:SS') AND ge.valide <= TO_TIMESTAMP(:datfin, 'YYYY-MM-DD HH24:MI:SS')) OR " +
            "    (:#{#query.typdat} = 'Début' AND ge.debute >= TO_TIMESTAMP(:datdeb, 'YYYY-MM-DD HH24:MI:SS') AND ge.debute <= TO_TIMESTAMP(:datfin, 'YYYY-MM-DD HH24:MI:SS')) OR " +
            "    (:#{#query.typdat} = 'Terminaison' AND ge.termin >= TO_TIMESTAMP(:datdeb, 'YYYY-MM-DD HH24:MI:SS') AND ge.termin <= TO_TIMESTAMP(:datfin, 'YYYY-MM-DD HH24:MI:SS')) OR " +
            "    (:#{#query.typdat} = 'Suspension' AND ge.suspen >= TO_TIMESTAMP(:datdeb, 'YYYY-MM-DD HH24:MI:SS') AND ge.suspen <= TO_TIMESTAMP(:datfin, 'YYYY-MM-DD HH24:MI:SS')) OR " +
            "    (:#{#query.typdat} = 'Invalidation' AND ge.invali >= TO_TIMESTAMP(:datdeb, 'YYYY-MM-DD HH24:MI:SS') AND ge.invali <= TO_TIMESTAMP(:datfin, 'YYYY-MM-DD HH24:MI:SS'))))) " ;

    String ORDER_BY = " ORDER BY ge.typetp, ge.codenv, ge.codorg, ge.codapp, ge.percod, ge.codcom, ge.codfic, ge.numcom, ge.codgam";

    @Query(QUERY_SELECT_FROM_GENETP + ORDER_BY)
    List<GenEtp> searchOccurrenceEtape(
            @Param("query") OccurrenceEtapePayload query,
            @Param("typetp") List<GenEtpType> typetp
    );

    @Query(QUERY_SELECT_FROM_GENETP + QUERY_ADD_DATDEB_DATFIN + ORDER_BY)
    List<GenEtp> searchOccurrenceEtapeWithTypdatDatdebDatfin(
            @Param("query") OccurrenceEtapePayload query,
            @Param("typetp") List<GenEtpType> typetp,
            @Param("datdeb") String datdeb,
            @Param("datfin") String datfin
    );

    @Query("SELECT DISTINCT new fr.acoss.posdoc.domain.genetp.model.DistinctCodenvCodorgCodappGenetp(ge.codenv, ge.codorg, ge.codapp) " +
            "FROM GenEtpEntity ge " +
            "ORDER BY ge.codenv, ge.codorg, ge.codapp")
    List<DistinctCodenvCodorgCodappGenetp> findDistinctCodenvCodorgCodapp();

    @Query("SELECT DISTINCT ga.id.codeEnv AS codenv, ga.id.codeApp AS codapp, ga.id.codeOrg AS codorg " +
            "FROM GenAppEntity ga ")
    List<Map<String, String>> getOccurrenceEtapeSearchData();

    @Query("SELECT DISTINCT ge.codgam FROM GenEtpEntity ge " +
            "WHERE ((:codenvs) IS NULL OR ge.codenv IN (:codenvs)) " +
            "AND ((:codorgs) IS NULL OR ge.codorg IN (:codorgs)) " +
            "AND ((:codapps) IS NULL OR ge.codapp IN (:codapps)) " +
            "AND ((:percods) IS NULL OR ge.percod IN (:percods))")
    List<String> getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(
            @Param("codenvs") List<String> codenvs,
            @Param("codorgs") List<String> codorgs,
            @Param("codapps") List<String> codapps,
            @Param("percods") List<String> percods
    );

    @Query("SELECT DISTINCT ge.codcom FROM GenEtpEntity ge " +
            "WHERE ((:codenvs) IS NULL OR ge.codenv IN (:codenvs)) " +
            "AND ((:codorgs) IS NULL OR ge.codorg IN (:codorgs)) " +
            "AND ((:codapps) IS NULL OR ge.codapp IN (:codapps)) " +
            "AND ((:percods) IS NULL OR ge.percod IN (:percods))")
    List<String> getDistinctComsByEnvsAndOrgsAndAppsAndPercods(
            @Param("codenvs") List<String> codenvs,
            @Param("codorgs") List<String> codorgs,
            @Param("codapps") List<String> codapps,
            @Param("percods") List<String> percods
    );

    @Query(
            "SELECT new fr.acoss.posdoc.domain.genetp.model.VideoStep(gl.idpere, ge.id, ge.typetp, ge.codenv, ge.codorg, ge.codapp, ge.percod, " +
                    "ge.numcom, ge.codcom, ge.codfic, ge.codgam, ge.statut, ge.codinf, ge.codser, ge.codsit, ge.codres, ge.coddes, ge.reedit, " +
                    "ge.etpfus, ge.script, ge.idtfus, ge.numexe, ge.nbrexe, ge.codsig, ge.signal, ge.fabsim, ge.create, ge.valide, ge.debute, ge.termin, " +
                    "ge.invali, ge.suspen, ge.histor, ge.stepno, ge.numpid, ge.clefus) " +
                    "FROM GenEtpEntity ge INNER JOIN GenlieEntity gl ON ge.id = gl.idfils " +
                    "WHERE (:codenv IS NULL OR ge.codenv = :codenv) AND (:codorg IS NULL OR ge.codorg = :codorg) " +
                    "AND (:codapp IS NULL OR ge.codapp = :codapp) AND (:percod IS NULL OR ge.percod = :percod) " +
                    "ORDER BY ge.codcom, ge.numcom, ge.codfic, ge.id, ge.codgam, ge.codres"
    )
    List<VideoStep> getVideoSteps(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod
    );

    @Query(
            "SELECT new fr.acoss.posdoc.domain.genetp.model.FirstVideoStep(ge.id, ge.typetp, ge.codenv, ge.codorg, ge.codapp, ge.percod, ge.numcom, " +
                    "ge.codcom, ge.codfic, ge.codgam, ge.statut, ge.codinf, ge.codser, ge.codsit, ge.codres, ge.coddes, ge.reedit, ge.etpfus, " +
                    "ge.script, ge.idtfus, ge.numexe, ge.nbrexe, ge.codsig, ge.signal, ge.fabsim, ge.create, ge.valide, ge.debute, ge.termin," +
                    "ge.invali, ge.suspen, ge.histor, ge.stepno, ge.numpid, ge.clefus) " +
                    "FROM GenEtpEntity ge WHERE ge.typetp = '"+TYPETP_DEB+"' " +
                    "AND (:codenv IS NULL OR ge.codenv = :codenv) AND (:codorg IS NULL OR ge.codorg = :codorg) " +
                    "AND (:codapp IS NULL OR ge.codapp = :codapp) AND (:percod IS NULL OR ge.percod = :percod) " +
                    "ORDER BY ge.codcom, ge.numcom, ge.codfic, ge.id, ge.codgam, ge.codres"
    )
    FirstVideoStep getFirstVideoStep(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod
    );

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenEtpEntity genetp SET " +
            " genetp.statut = '"+VALIDE+"', " +
            " genetp.valide = now(), " +
            " genetp.codinf = :codinf, " +
            " genetp.stepno = '"+STEPNO_0+"' " +
            " WHERE " +
            " genetp.id = :idetap ")
    void valideGenEtpByIdetap(
            @Param("idetap") Integer idetap,
            @Param("codinf") Integer codinf
    );

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenEtpEntity genetp SET " +
            " genetp.statut = '"+VALIDE+"', " +
            " genetp.valide = now(), " +
            " genetp.codinf = :codinf, " +
            " genetp.stepno = '"+STEPNO_0+"' " +
            " WHERE " +
            " (genetp.id = :idtfus) OR " +
            " (genetp.idtfus = :idtfus AND genetp.statut = :statut) ")
    void valideGenEtpByIdtfusAndStatut(
            @Param("idtfus") Integer idtfus,
            @Param("statut") String statut,
            @Param("codinf") Integer codinf
    );

    @Query(
            "SELECT count(ge.statut) > 0 " +
                    " FROM GenEtpEntity ge WHERE ge.statut = '"+SUSPENDU+"' " +
                    " AND ge.codenv = :#{#query.codenv} " +
                    " AND ge.codorg = :#{#query.codorg} " +
                    " AND ge.codapp = :#{#query.codapp} " +
                    " AND ge.percod = :#{#query.percod} "
    )
    boolean isExistEtpSuspendu(@Param("query") GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);

    @Query("SELECT genetp FROM GenEtpEntity genetp " +
            "INNER JOIN GenlieEntity genlie " +
            "   ON genetp.id = genlie.idfils " +
            "WHERE genlie.idpere = :idEtape ")
    List<GenEtpEntity> getLiens(@Param("idEtape") Integer idEtape);

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query(QUERY_UPDATE_GENETP_INVALIDATE +
            "WHERE genetp.id = :idEtape ")
    void invalidateGenEtpByIdEtape(
            @Param("idEtape") Integer idEtape
    );

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query(QUERY_UPDATE_GENETP_INVALIDATE +
            "WHERE genetp.id = :idEtape" +
            "   AND genetp.statut = :statut ")
    void invalidateGenEtpByIdEtapeAndStatut(
            @Param("idEtape") Integer idEtape,
            @Param("statut") String statut
    );

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query(QUERY_UPDATE_GENETP_INVALIDATE +
            "WHERE genetp.idtfus = :idEtape" +
            "   AND genetp.statut = :statut ")
    void invalidateGenEtpByIdtfusAndStatut(
            @Param("idEtape") Integer idEtape,
            @Param("statut") String statut
    );

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenEtpEntity genetp SET " +
            " genetp.statut = '"+TERMINE+"', " +
            " genetp.codinf = '"+CODINF_0+"', " +
            " genetp.termin = now() " +
            " WHERE " +
            " genetp.typetp = '"+TYPETP_MSP+"' AND " +
            " genetp.codenv = :codenv AND " +
            " genetp.codorg = :codorg AND " +
            " genetp.codapp = :codapp AND " +
            " genetp.percod = :percod AND " +
            " genetp.codcom = :codcom AND " +
            " genetp.numcom = :numcom AND " +
            " genetp.codfic = :codfic "
    )
    void termineGenEtpByBonTravail(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod,
            @Param("numcom") String numcom,
            @Param("codcom") String codcom,
            @Param("codfic") String codfic
    );

    @Query(
            "SELECT count(ge.statut) > 0 " +
                    " FROM GenEtpEntity ge " +
                    " WHERE ge.statut in ('"+CREE+"', '"+VALIDE+"', '"+DEBUTE+"', '"+SUSPENDU+"') " +
                    " AND ge.typetp = '"+TYPETP_DIS+"' " +
                    " AND ge.codenv = :#{#query.codenv} " +
                    " AND ge.codorg = :#{#query.codorg} " +
                    " AND ge.codapp = :#{#query.codapp} " +
                    " AND ge.percod = :#{#query.percod} "
    )
    boolean isExistGenEtpTypDisStatCVDS(@Param("query") GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);

    @QueryLog(entity ="GenEtpEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenEtpEntity ge SET " +
            " ge.statut = '"+VALIDE+"', " +
            " ge.valide = now(), " +
            " ge.codinf = '"+CODINF_0+"' " +
            " WHERE ge.typetp = '"+TYPETP_BIL+"' " +
            " AND ge.codenv = :#{#query.codenv} " +
            " AND ge.codorg = :#{#query.codorg} " +
            " AND ge.codapp = :#{#query.codapp} " +
            " AND ge.percod = :#{#query.percod} "
    )
    void valideGenEtpTypBil(@Param("query") GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);

    @QueryLog(entity = "GenEtpEntity", action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query("DELETE FROM GenEtpEntity ge " +
            "WHERE ge.codenv = :#{#query.codenv} " +
            "   AND ge.codorg = :#{#query.codorg} " +
            "   AND ge.codapp = :#{#query.codapp} " +
            "   AND ge.percod = :#{#query.percod}")
    void deleteGenEtp(@Param("query") DeleteBonTravailManuelQuery query);

    @Query("SELECT DISTINCT ge.codenv from GenEtpEntity ge")
    List<String> getDistinctEnvs();
    @Query("SELECT DISTINCT ge.codorg from GenEtpEntity ge")
    List<String> getDistinctOrgs();

    @Query("SELECT COUNT(*) > 0 FROM GenEtpEntity ge " +
            "WHERE ge.typetp = '" + TYPETP_DIS + "' AND ge.codenv = :#{#query.codenv} " +
            "   AND ge.codorg = :#{#query.codorg} AND ge.codapp = :#{#query.codapp} " +
            "   AND ge.percod = :#{#query.percod} AND ge.codcom = :#{#query.codcom} " +
            "   AND ge.codfic = :#{#query.codfic} AND ge.numcom = :#{#query.numcom} " +
            "   AND ge.codsit = :#{#query.codsit} AND ge.codres = :#{#query.codres} " +
            "   AND ge.codgam = :#{#query.codgam} ")
    boolean checkIfGenEtpExists(@Param("query") GenEtpExistsQuery query);
}
