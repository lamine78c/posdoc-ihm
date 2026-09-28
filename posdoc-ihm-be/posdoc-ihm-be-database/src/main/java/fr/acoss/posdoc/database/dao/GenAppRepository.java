package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenAppCompositeId;
import fr.acoss.posdoc.database.entities.GenAppEntity;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.IsBonTravailManuelInput;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriodeInput;
import fr.acoss.posdoc.domain.genapp.model.GenApp;
import fr.acoss.posdoc.domain.genapp.model.OccurrenceApplication;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpEnvOrgAppPercodQuery;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import fr.acoss.posdoc.domain.genfic.model.OccurenceApplication;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsCommandesFichiersPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsFichiersProduitsDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsGeneralitesPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsNoticesDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProductionInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OngletsParamDataInput;
import fr.acoss.posdoc.domain.occurrence.application.model.SearchOccurrenceApplicationInput;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static fr.acoss.posdoc.types.ApplicationStatut.APPSTA_C;
import static fr.acoss.posdoc.types.ApplicationStatut.APPSTA_D;
import static fr.acoss.posdoc.types.ApplicationStatut.APPSTA_S;
import static fr.acoss.posdoc.types.ApplicationStatut.APPSTA_T;

@Repository
public interface GenAppRepository extends GenericRepository<GenAppEntity, GenAppCompositeId> {
    String INNER_JOIN_ORGANISME = " INNER JOIN OrganismeEntity o ON o.code = ga.id.codeOrg ";
    String CRITER_AND_GA_DAPPLT = "' AND ga.dapplt >= TO_TIMESTAMP((:#{#query.currDate}), 'YYYY-MM-DD HH24:MI:SS'))) ";
    String WHERE_COMMON = " WHERE (ga.appsta IN ('" + APPSTA_C + "','" + APPSTA_D + "','" + APPSTA_S + "') OR (ga.appsta='" + APPSTA_T + CRITER_AND_GA_DAPPLT;
    String CODENV_AND_CLAUSE = " AND ((:#{#query.codEnv}) IS NULL OR ga.id.codeEnv = (:#{#query.codEnv})) ";
    String CODORGS_AND_CLAUSE = " AND ((:#{#query.codOrgs}) IS NULL OR ga.id.codeOrg in (:#{#query.codOrgs})) ";
    String CODAPP_AND_CLAUSE = " AND ((:#{#query.codApp}) IS NULL OR ga.id.codeApp = (:#{#query.codApp})) ";
    String QUERY_SEARCH_OCCURENCE_APPLICATION_NON_SITE = " SELECT new fr.acoss.posdoc.domain.genfic.model.OccurenceApplication(ga.id.codeEnv,ga.id.codeOrg,ga.id.codeApp,ga.id.perCod,ga.appsta,ga.dapplc,ga.dappld,ga.dapplt,o.codeSite) FROM GenAppEntity ga " +
            INNER_JOIN_ORGANISME +
            WHERE_COMMON +
            CODENV_AND_CLAUSE +
            CODORGS_AND_CLAUSE +
            CODAPP_AND_CLAUSE;
    String QUERY_SEARCH_OCCURENCE_APPLICATION_EXT = " SELECT DISTINCT new fr.acoss.posdoc.domain.genfic.model.OccurenceApplication(ga.id.codeEnv,ga.id.codeOrg,ga.id.codeApp,ga.id.perCod,ga.appsta,ga.dapplc,ga.dappld,ga.dapplt,o.codeSite) FROM GenAppEntity ga " +
            INNER_JOIN_ORGANISME +
            " INNER JOIN GenFicEntity gf ON gf.id.percod = ga.id.perCod AND gf.id.codapp = ga.id.codeApp AND gf.id.codorg = ga.id.codeOrg AND gf.id.codenv = ga.id.codeEnv " +
            WHERE_COMMON +
            " AND (o.codeSite = (:#{#query.codSit}) OR ( o.codeSite != (:#{#query.codSit}) AND gf.codsit = (:#{#query.codSit}) ) ) " +
            CODENV_AND_CLAUSE +
            CODORGS_AND_CLAUSE +
            CODAPP_AND_CLAUSE;
    String QUERY_SEARCH_OCCURENCE_APPLICATION_NON_EXT = " SELECT new fr.acoss.posdoc.domain.genfic.model.OccurenceApplication(ga.id.codeEnv,ga.id.codeOrg,ga.id.codeApp,ga.id.perCod,ga.appsta,ga.dapplc,ga.dappld,ga.dapplt,o.codeSite) FROM GenAppEntity ga " +
            INNER_JOIN_ORGANISME +
            WHERE_COMMON +
            " AND (o.codeSite = (:#{#query.codSit})) " +
            CODENV_AND_CLAUSE +
            CODORGS_AND_CLAUSE +
            CODAPP_AND_CLAUSE;
    String QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_APPLICATION = " ORDER BY ga.id.codeEnv ASC, ga.id.codeOrg ASC, ga.id.codeApp ASC, ga.id.perCod ASC ";
    String QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_DATE = " ORDER BY ga.dappld ASC, ga.id.codeEnv ASC, ga.id.codeOrg ASC, ga.id.codeApp ASC, ga.id.perCod ASC ";
    String QUERY_DETAILS_GENERALITES = "SELECT new fr.acoss.posdoc.domain.occurrence.application.model.DetailsGeneralitesPayload" +
            "(a.libelle, g.arefec, g.typref, g.appsta, g.appinf, g.dapplc, g.dappld, g.dapplt, g.dappls, g.dapplh) " +
            "FROM ApplicationEntity a, GenAppEntity g " +
            "WHERE a.id.codeEnvironnement = g.id.codeEnv AND a.id.codeOrganisation = g.id.codeOrg AND a.id.code = g.id.codeApp " +
            "AND g.id.codeEnv = :#{#query.codEnv} AND g.id.codeOrg = :#{#query.codOrg} AND g.id.codeApp = :#{#query.codApp} AND g.id.perCod = :#{#query.perCod}";

    @Query(QUERY_SEARCH_OCCURENCE_APPLICATION_NON_SITE + QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_APPLICATION)
    List<OccurenceApplication> searchOccurenceNonSitePerApplication(
            @Param("query") SearchOccurrenceApplicationInput query
    );
    @Query(QUERY_SEARCH_OCCURENCE_APPLICATION_NON_SITE + QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_DATE)
    List<OccurenceApplication> searchOccurenceNonSitePerApplicationOrderByDate(
            @Param("query") SearchOccurrenceApplicationInput query
    );
    @Query(QUERY_SEARCH_OCCURENCE_APPLICATION_EXT + QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_APPLICATION)
    List<OccurenceApplication> searchOccurenceExtPerApplication(
            @Param("query") SearchOccurrenceApplicationInput query
    );
    @Query(QUERY_SEARCH_OCCURENCE_APPLICATION_NON_EXT + QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_DATE)
    List<OccurenceApplication> searchOccurenceExtPerApplicationOrderByDate(
            @Param("query") SearchOccurrenceApplicationInput query
    );
    @Query(QUERY_SEARCH_OCCURENCE_APPLICATION_NON_EXT + QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_APPLICATION)
    List<OccurenceApplication> searchOccurenceNonExtPerApplication(
            @Param("query") SearchOccurrenceApplicationInput query
    );
    @Query(QUERY_SEARCH_OCCURENCE_APPLICATION_EXT + QUERY_SEARCH_OCCURENCE_APPLICATION_ORDER_BY_DATE)
    List<OccurenceApplication> searchOccurenceNonExtPerApplicationOrderByDate(
            @Param("query") SearchOccurrenceApplicationInput query
    );

    @Query(QUERY_DETAILS_GENERALITES)
    List<DetailsGeneralitesPayload> getDetailsGeneralites(@Param("query") OngletsParamDataInput query);

    @Query(" SELECT DISTINCT new fr.acoss.posdoc.domain.genfic.model.EnvOrgApp(g.id.codeEnv, g.id.codeOrg, g.id.codeApp) FROM GenAppEntity g ")
    List<EnvOrgApp> getDistinctEnvOrgApp();

    @Query("SELECT new fr.acoss.posdoc.domain.occurrence.application.model.DetailsCommandesFichiersPayload(" +
            "gf.id.codcom, gf.id.numcom, gf.id.codfic, c.libelle, gf.codprd, gf.refimp, gf.libfic, " +
            "gf.ficsta, gf.ficinf, gf.dappcr, gf.dfichd, gf.dficht, gf.dfichs, gf.frefec, gf.ficvid)" +
            "FROM GenFicEntity gf " +
            "INNER JOIN CommandeEntity c ON c.id.codenv = gf.id.codenv " +
            "AND c.id.codorg = gf.id.codorg AND c.id.codapp = gf.id.codapp AND c.id.code = gf.id.codcom " +
            "WHERE gf.id.codenv = :#{#query.codEnv} " +
            "AND gf.id.codorg = :#{#query.codOrg} " +
            "AND gf.id.codapp = :#{#query.codApp} " +
            "AND gf.id.percod = :#{#query.perCod} " +
            "ORDER BY gf.id.codcom, gf.id.numcom, gf.id.codfic")
    List<DetailsCommandesFichiersPayload> getDetailsCommandesFichiers(@Param("query") OngletsParamDataInput query);

    @Query("SELECT new fr.acoss.posdoc.domain.occurrence.application.model.DetailsFichiersProduitsDTO(" +
            "g.id.codcom, g.id.codfic, g.id.numcom, g.refimp, g.codprd, f.libFichier, " +
            "p.pagFic, e.id.codgam, e.codsit, e.codres, e.coddes, e.nbrexe) " +
            "FROM FichierEntity f " +
            "LEFT JOIN GenFicEntity g ON f.id.codeFich = g.id.codfic AND f.id.codeCom = g.id.codcom " +
            "AND f.id.codeApp = g.id.codapp AND f.id.codeOrg = g.id.codorg " +
            "AND f.id.codeEnv = g.id.codenv " +
            "LEFT JOIN GenProEntity p ON g.id.codfic = p.id.codeFic AND g.id.numcom = p.id.numCom " +
            "AND g.id.codcom = p.id.codeCom AND g.id.percod = p.id.perCod " +
            "AND g.id.codapp = p.id.codeApp AND g.id.codorg = p.id.codeOrg AND g.id.codenv = p.id.codeEnv " +
            "LEFT JOIN ExemplaireEntity e ON p.id.codeGam = e.id.codgam AND p.id.codeFic = e.id.codfic " +
            "AND p.id.codeCom = e.id.codcom AND p.id.codeApp = e.id.codapp " +
            "AND p.id.codeOrg = e.id.codorg AND p.id.codeEnv = e.id.codenv " +
            "WHERE g.id.codenv = :#{#query.codEnv} " +
            "AND g.id.codorg = :#{#query.codOrg} " +
            "AND g.id.codapp = :#{#query.codApp} " +
            "AND g.id.percod = :#{#query.perCod} " +
            "ORDER BY g.id.codcom, g.id.codfic, g.id.numcom")
    List<DetailsFichiersProduitsDTO> getDetailsFichiersProduits(@Param("query") OngletsParamDataInput query);

    @Query("SELECT e.coddes as coddes, gf.id.codcom as codcom, gf.id.codfic as codfic, gf.id.numcom as numcom, " +
            "   e.id.codgam as codgam, gf.codprd as codprd, gf.refimp as refimp, CAST(e.nbrexe as string) as nbrexe, " +
            "   CAST(gp.pagFic as string) as pagfic, f.libFichier as libfic, d.libelle as libdes " +
            "FROM FichierEntity f " +
            "INNER JOIN GenFicEntity gf ON f.id.codeEnv = gf.id.codenv AND f.id.codeOrg = gf.id.codorg " +
            "   AND f.id.codeApp = gf.id.codapp AND f.id.codeCom = gf.id.codcom AND f.id.codeFich = gf.id.codfic " +
            "INNER JOIN GenProEntity gp ON gf.id.codfic = gp.id.codeFic AND gf.id.numcom = gp.id.numCom " +
            "   AND gf.id.codcom = gp.id.codeCom AND gf.id.percod = gp.id.perCod AND gf.id.codapp = gp.id.codeApp " +
            "   AND gf.id.codorg = gp.id.codeOrg AND gf.id.codenv = gp.id.codeEnv " +
            "INNER JOIN ExemplaireEntity e ON gp.id.codeGam = e.id.codgam AND gp.id.codeFic = e.id.codfic " +
            "   AND gp.id.codeCom = e.id.codcom AND gp.id.codeApp = e.id.codapp AND gp.id.codeOrg = e.id.codorg " +
            "   AND gp.id.codeEnv = e.id.codenv " +
            "INNER JOIN DestinataireEntity d ON e.coddes = d.id.code AND e.id.codorg = d.id.codeOrg " +
            "WHERE gf.id.codenv = :#{#query.codEnv} AND gf.id.codorg = :#{#query.codOrg} " +
            "   AND gf.id.codapp = :#{#query.codApp} AND gf.id.percod = :#{#query.perCod} " +
            "ORDER BY coddes, codcom, codfic, numcom")
    List<Map<String, String>> getDetailsFichesLiaison(@Param("query") OngletsParamDataInput query);

    @Query("SELECT new fr.acoss.posdoc.domain.occurrence.application.model.DetailsNoticesDTO(" +
            "g.id.codcom, g.id.codfic, g.id.numcom, gf.codprd, gf.refimp, gf.libfic, " +
            "g.id.codnot, g.poinot, n.fornot, n.pornot, n.libnot, n.codsit) " +
            "FROM NoticeEntity n " +
            "LEFT JOIN GenNotEntity g ON n.codnot = g.id.codnot " +
            "LEFT JOIN GenFicEntity gf ON g.id.codfic = gf.id.codfic AND g.id.numcom = gf.id.numcom " +
            "AND g.id.codcom = gf.id.codcom AND g.id.percod = gf.id.percod " +
            "AND g.id.codapp = gf.id.codapp AND g.id.codorg = gf.id.codorg AND g.id.codenv = gf.id.codenv " +
            "WHERE g.id.codenv = :#{#query.codEnv} " +
            "AND g.id.codorg = :#{#query.codOrg} " +
            "AND g.id.codapp = :#{#query.codApp} " +
            "AND g.id.percod = :#{#query.perCod} " +
            "ORDER BY g.id.codcom, g.id.codfic, g.id.numcom, g.id.codnot")
    List<DetailsNoticesDTO> getDetailsNotices(@Param("query") OngletsParamDataInput query);

    @Query("SELECT DISTINCT ga.id.perCod as percod, ga.appsta as appsta, CAST(ga.dappld as string) as dappld, " +
            "   CAST(ga.dapplt as string) as dapplt, CASE WHEN (ga.manuel = 0) THEN 'false' ELSE 'true' END as manuel " +
            " FROM GenAppEntity ga "+
            " WHERE ga.id.codeEnv = :#{#query.codEnv} " +
            "   AND ga.id.codeApp = :#{#query.codApp} " +
            "   AND ga.id.codeOrg IN :#{#query.codOrgs} " +
            "   AND ga.manuel is false " +
            " ORDER BY percod desc")
    List<Map<String, String>> getDetailsPeriode(@Param("query") DetailsPeriodeInput query);

    @Query("SELECT DISTINCT ga.id.perCod as percod, ga.appsta as appsta, CAST(ga.dappld as string) as dappld, " +
            "   CAST(ga.dapplt as string) as dapplt, CASE WHEN (ga.manuel = 0) THEN 'false' ELSE 'true' END as manuel " +
            " FROM GenAppEntity ga "+
            " WHERE ga.id.codeEnv = :#{#query.codEnv} " +
            "   AND ga.id.codeApp = :#{#query.codApp} " +
            "   AND ga.id.codeOrg IN :#{#query.codOrgs} " +
            " ORDER BY percod desc")
    List<Map<String, String>> getDetailsPeriodeWithManuel(@Param("query") DetailsPeriodeInput query);

    @Query("SELECT new fr.acoss.posdoc.domain.genapp.model.OccurrenceApplication(" +
            "genapp.appsta, genapp.appinf, genapp.dapplc, genapp.dappld, genapp.dapplt, genapp.dappls, genapp.typref, genapp.sitori) " +
            " FROM GenAppEntity genapp "+
            " WHERE genapp.id.codeEnv = :#{#query.codEnv}" +
            " AND genapp.id.codeApp = :#{#query.codApp} " +
            " AND genapp.id.codeOrg = :#{#query.codOrg} " +
            " AND genapp.id.perCod = :#{#query.perCod}")
    OccurrenceApplication getOccurrenceApplication(@Param("query") OccurrenceApplicationInput query);

    @QueryLog(entity ="GenAppEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenAppEntity genapp SET " +
            " genapp.appsta = '"+APPSTA_T+"', " +
            " genapp.appinf = '001', " +
            " genapp.dapplt = now() " +
            " WHERE " +
            " genapp.id.codeEnv = :#{#query.codEnv} AND " +
            " genapp.id.codeApp = :#{#query.codApp} AND " +
            " genapp.id.codeOrg = :#{#query.codOrg} AND " +
            " genapp.id.perCod = :#{#query.perCod}")
    void termineGenApp(@Param("query") OccurrenceApplicationInput query);

    @Query("SELECT new fr.acoss.posdoc.domain.genapp.model.GenApp(" +
            "g.id.codeEnv, g.id.codeOrg, g.id.codeApp, g.id.perCod, g.appsta, g.appinf, g.arefec, " +
            "g.dapplc, g.dappld, g.dapplt, g.dappls, g.dapplh, g.typref, g.manuel, g.sitori) " +
            "FROM GenAppEntity g " +
            "WHERE g.id.codeEnv = :#{#query.codEnv} AND g.id.codeOrg = :#{#query.codOrg} " +
            "   AND g.id.codeApp = :#{#query.codApp} AND g.id.perCod = :#{#query.perCod}")
    List <GenApp> finGenAppByCodenvCodorgCodappPercod(@Param("query") OccurrenceApplicationInput query);

    @Query("SELECT g.manuel FROM GenAppEntity g WHERE g.id.codeEnv = :#{#query.codenv} AND " +
            "g.id.codeOrg = :#{#query.codorg} AND g.id.codeApp = :#{#query.codapp} AND g.id.perCod = :#{#query.percod}")
    Boolean isBonTravailManuel(@Param("query") IsBonTravailManuelInput query);

    @QueryLog(entity = "GenAppEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenAppEntity genapp SET " +
            " genapp.appsta = '"+APPSTA_D+"' " +
            " WHERE " +
            " genapp.id.codeEnv = :#{#query.codenv} AND " +
            " genapp.id.codeApp = :#{#query.codapp} AND " +
            " genapp.id.codeOrg = :#{#query.codorg} AND " +
            " genapp.id.perCod = :#{#query.percod}"
    )
    void startGenApp(@Param("query") GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);

    @Query("SELECT g.id.perCod FROM GenAppEntity g WHERE g.id.codeEnv = :codenv " +
            "AND g.id.codeOrg = :codorg AND g.id.codeApp = :codapp " +
            "AND g.id.perCod LIKE :percod ORDER BY g.id.perCod DESC")
    List<String> findPercodByPercod(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod
    );

    @QueryLog(entity = "GenAppEntity", action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query("DELETE FROM GenAppEntity ga " +
            "WHERE ga.id.codeEnv = :#{#query.codenv} " +
            "   AND ga.id.codeOrg = :#{#query.codorg} " +
            "   AND ga.id.codeApp = :#{#query.codapp} " +
            "   AND ga.id.perCod = :#{#query.percod}")
    void deleteGenApp(@Param("query") DeleteBonTravailManuelQuery query);

    @Query("SELECT ga.id.codeEnv as codenv, ga.id.codeOrg as codorg, ga.id.codeApp as codapp, ga.id.perCod as percod, " +
            "   ga.appsta as appsta, ga.appinf as appinf, CASE WHEN (ga.arefec = 0) THEN 'false' ELSE 'true' END as arefec, " +
            "   CAST(ga.dappld as string) as dappld, CAST(ga.dapplt as string) as dapplt, CAST(ga.dappls as string) as dappls, " +
            "   CASE WHEN (ga.manuel = 0) THEN 'false' ELSE 'true' END as manuel, o.codeSite as codsit, gf.id.codcom as codcom, " +
            "   gf.id.codfic as codfic, gf.id.numcom as numcom, gf.codprd as codprd, gf.ficsta as ficsta, gf.ficinf as ficinf, " +
            "   CASE WHEN (gf.frefec = 0) THEN 'false' ELSE 'true' END as frefec, CASE WHEN (gf.ficvid = 0) THEN 'false' ELSE 'true' END as ficvid, " +
            "   CAST(gf.dappcr as string) as dappcr, CAST(gf.dfichd as string) as dfichd, CAST(gf.dficht as string) as dficht, " +
            "   CAST(gf.dfichs as string) as dfichs " +
            "FROM GenAppEntity ga " +
            "INNER JOIN OrganismeEntity o ON o.code = ga.id.codeOrg " +
            "LEFT JOIN GenFicEntity gf " +
            "   ON gf.id.codenv = ga.id.codeEnv" +
            "   AND gf.id.codorg = ga.id.codeOrg " +
            "   AND gf.id.codapp = ga.id.codeApp " +
            "   AND gf.id.percod = ga.id.perCod " +
            "WHERE ga.id.codeEnv = :#{#query.codenv} AND ((:#{#query.codorgs}) IS NULL OR ga.id.codeOrg IN (:#{#query.codorgs})) " +
            "   AND (:#{#query.codapp} IS NULL OR ga.id.codeApp = :#{#query.codapp}) " +
            "   AND (:#{#query.percod} IS NULL OR ga.id.perCod = :#{#query.percod}) " +
            "   AND (:#{#query.codsit} IS NULL OR o.codeSite = :#{#query.codsit}) " +
            "ORDER BY codenv, codorg, codapp, percod DESC, codcom, codfic, numcom")
    List<Map<String, String>> getOccurrenceApplicationForSuiviProduction(@Param("query") OccurrenceApplicationSuiviProductionInput query);

    @Query("SELECT COUNT(*) " +
            "FROM GenAppEntity ga " +
            "INNER JOIN OrganismeEntity o ON o.code = ga.id.codeOrg " +
            "LEFT JOIN GenFicEntity gf " +
            "   ON gf.id.codenv = ga.id.codeEnv" +
            "   AND gf.id.codorg = ga.id.codeOrg " +
            "   AND gf.id.codapp = ga.id.codeApp " +
            "   AND gf.id.percod = ga.id.perCod " +
            "WHERE ga.id.codeEnv = :#{#query.codenv} AND ((:#{#query.codorgs}) IS NULL OR ga.id.codeOrg IN (:#{#query.codorgs})) " +
            "   AND (:#{#query.codapp} IS NULL OR ga.id.codeApp = :#{#query.codapp}) " +
            "   AND (:#{#query.percod} IS NULL OR ga.id.perCod = :#{#query.percod}) " +
            "   AND (:#{#query.codsit} IS NULL OR o.codeSite = :#{#query.codsit}) ")
    Integer countOccurrencesApplicationForSuiviProduction(@Param("query") OccurrenceApplicationSuiviProductionInput query);

}
