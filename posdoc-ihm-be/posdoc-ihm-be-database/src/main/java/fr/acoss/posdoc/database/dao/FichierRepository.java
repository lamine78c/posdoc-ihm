package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.domain.fichier.model.ComFichProdInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvAppRefImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvDocImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.query.EnvOrgsAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;

@Repository
public interface FichierRepository extends GenericRepository<FichierEntity, FichierCompositeId> {

    @Query(value = "SELECT new fr.acoss.posdoc.domain.fichier.model.Fichier(a.id.codeEnv, a.id.codeOrg," +
            "a.id.codeApp, a.id.codeCom, a.id.codeFich, a.libFichier, a.refImprime, a.codeAdr, a.codeProd, " +
            "a.refFormat, a.typeFormat, a.page, a.codeClient, a.typeSig, a.typeMultif, a.typeSupport, a.refSupport, a.eclatement, a.codeDocument, " +
            "(CASE WHEN EXISTS (SELECT 1 FROM ProduiEntity p " +
            "                    WHERE p.id.codapp = a.id.codeApp " +
            "                      AND p.id.codenv = a.id.codeEnv " +
            "                      AND p.id.codorg = a.id.codeOrg " +
            "                      AND p.id.codcom = a.id.codeCom) " +
            "      THEN true ELSE false END)) " +
            "FROM FichierEntity a ORDER BY a.id.codeFich DESC ")
    List<Fichier> findFichiers();


    @Override
    List<FichierEntity> findAllById(Iterable<FichierCompositeId> iterable);

    @Query(value = "SELECT (COUNT(p) > 0) FROM FichierEntity a " +
            "LEFT JOIN ProduiEntity p ON p.id.codapp = a.id.codeApp and p.id.codenv = a.id.codeEnv and p.id.codorg = a.id.codeOrg and p.id.codcom = a.id.codeCom and p.id.codfic = a.id.codeFich " +
            "WHERE a.id.codeEnv LIKE :codeEnv and  a.id.codeOrg LIKE :codeOrg and a.id.codeApp LIKE :codeApp and a.id.codeCom LIKE :codeCom and a.id.codeFich LIKE :codeFich")
    boolean findFichierById(@Param("codeEnv") String codeEnv, @Param("codeOrg") String codeOrg, @Param("codeApp") String codeApp,
                                  @Param("codeCom") String codeCom, @Param("codeFich") String codeFich);

    @Query(value = "SELECT a FROM FichierEntity a WHERE " +
            "    (:codeEnv IS NULL OR a.id.codeEnv LIKE :codeEnv)" +
            " and ((:codesOrg) IS NULL OR a.id.codeOrg IN (:codesOrg))" +
            " and ((:codesApp) IS NULL OR a.id.codeApp IN (:codesApp))" +
            " and ((:codesCom) IS NULL OR a.id.codeCom IN (:codesCom))" +
            " ORDER BY a.id.codeFich DESC  "
    )
    List<FichierEntity> findFichiersByApp(@Param("codeEnv") String codeEnv, @Param("codesOrg") List<String> codesOrg,
                                            @Param("codesApp") List<String> codesApp,@Param("codesCom") List<String> codesCom );

    @Query(value = "SELECT a FROM FichierEntity a WHERE " +
            "    ((:codesOrg) IS NULL OR a.id.codeOrg IN (:codesOrg))" +
            " and ((:codesFic) IS NULL OR a.id.codeFich IN (:codesFic))" +
            " and ((:codesPrd) IS NULL OR a.codeProd IN (:codesPrd))" +
            " and ((:libsFichier) IS NULL OR a.libFichier IN (:libsFichier))"
    )
    List<FichierEntity> findFichiersForUpdatingReference(@Param("codesOrg") List<String> codesOrg, @Param("codesFic") List<String> codesFic,
                                                         @Param("codesPrd") List<String> codesPrd,@Param("libsFichier") List<String> libsFichier);

    @Query(value = "SELECT a FROM FichierEntity a WHERE " +
            "    a.id.codeEnv = :codeEnv " +
            "AND a.id.codeOrg = :codeOrg " +
            "AND a.id.codeApp = :codeApp " +
            "AND a.id.codeCom = :codeCom " +
            "AND a.id.codeFich = :codeFich "
    )
    FichierEntity findFichierForUpdatingReference(@Param("codeEnv") String codeEnv, @Param("codeOrg") String codeOrg, @Param("codeApp") String codeApp,
                                                         @Param("codeCom") String codeCom, @Param("codeFich") String codeFich);

    @Query(value = "SELECT f FROM FichierEntity f WHERE " +
            "    ((:codesEnv) IS NULL OR f.id.codeEnv IN (:codesEnv))" +
            " and ((:codesApp) IS NULL OR f.id.codeApp IN (:codesApp))" +
            " and ((:refsImp) IS NULL OR f.refImprime IN (:refsImp))"
    )
    List<FichierEntity> getFichiersForUpdatingReference(@Param("codesEnv") List<String> codesEnv, @Param("codesApp") List<String> codesApp,
                                                         @Param("refsImp") List<String> refsImp);

    @Query(value = "SELECT DISTINCT CONCAT(g.id.codeCom,'-',g.id.codeFic,'-',g.id.numCom,' [ Statut : ',g.proSta,' ] ( ', f.libFichier, ' ) - ', f.refImprime) FROM FichierEntity f " +
            "LEFT JOIN GenProEntity g " +
            "ON f.id.codeEnv = g.id.codeEnv AND f.id.codeOrg = g.id.codeOrg AND f.id.codeApp = g.id.codeApp " +
            "AND f.id.codeCom = g.id.codeCom AND f.id.codeFich = g.id.codeFic " +
            "WHERE f.id.codeEnv = :codeEnv " +
            "AND g.id.codeOrg = :codeOrg " +
            "AND g.id.codeApp = :codeApp " +
            "AND g.id.perCod = :perCod " +
            "AND g.id.codeGam = :codeGam " +
            "ORDER BY CONCAT(g.id.codeCom,'-',g.id.codeFic,'-',g.id.numCom,' [ Statut : ',g.proSta,' ] ( ', f.libFichier, ' ) - ', f.refImprime)"
    )
    List<String> getFichiersToAddNewExemplaire(
            @Param("codeEnv") String codeEnv, @Param("codeOrg") String codeOrg,
            @Param("codeApp") String codeApp, @Param("perCod") String perCod,
            @Param("codeGam") String codeGam
    );

    @Query("select case when (count(*) > 0) then true else false end from FichierEntity where id.codeFich = :codeFich")
    boolean existsByCodeFic(@Param("codeFich") String codeFich);

    @Query("select distinct f.typeFormat from FichierEntity f where f.typeFormat in :formatCodes")
    List<String> formatsExistsInFichiers(@Param("formatCodes") List<String> formatCodes);

    @Query(value = "SELECT f FROM FichierEntity f WHERE codeAdr IS NOT NULL AND codeAdr != '' ORDER BY codeAdr, id.codeOrg ")
    List<FichierEntity> getFichiersWithCodeAdr();

    @QueryLog(entity = "FichierEntity", action = MyslogAction.UPDATE)
    @Transactional
    @Modifying
    @Query(value = "UPDATE FichierEntity f SET f.codeAdr = null " +
            "  WHERE f.id.codeOrg = :codeOrg and f.codeAdr = :codeAdr "
    )
    void setCodeAdrNullByFicAdr(@Param("codeAdr") String codeAdr, @Param("codeOrg") String codeOrg);

    @Query("select distinct typeMultif from FichierEntity where typeMultif in :multifCodes")
    List<String> multifsExistsInFichiers(@Param("multifCodes") List<String> multifCodes);
    @Query("select distinct typeSupport from FichierEntity where typeSupport in :supportCodes")
    List<String> supportsExistsInFichiers(@Param("supportCodes") List<String> supportCodes);

    @Query("select distinct f.id.codeFich from FichierEntity f where f.id.codeCom in (:compositionCodes)")
    List<String> compositionsExistsInFichier(@Param("compositionCodes") List<String> compositionCodes);

    @Query("select distinct f.id.codeFich from FichierEntity f where f.refech in (:echantillonCodes)")
    List<String> echantillonsExistsInFichiers(@Param("echantillonCodes") List<String> echantillonCodes);

    @Query("select distinct f.id.codeFich from FichierEntity f where f.id.codeCom in (:commandeCodes) " +
            "AND f.id.codeEnv in (:commandeEnvs) AND f.id.codeOrg in (:commandeOrgs) AND f.id.codeApp in (:commandeApps)")
    List<String> commandesExistsInFichiers(
            @Param("commandeCodes") List<String> commandeCodes,
            @Param("commandeEnvs") List<String> commandeEnvs,
            @Param("commandeOrgs") List<String> commandeOrgs,
            @Param("commandeApps") List<String> commandeApps
    );

    @Query("select distinct f.id.codeFich from FichierEntity f where f.codeClient in (:clientCodes)")
    List<String> clientsExistsInFichiers(@Param("clientCodes") List<String> clientCodes);

    @Query("select distinct f.id.codeFich from FichierEntity f where f.refImprime in (:imprimeCodes)")
    List<String> imprimesExistsInFichiers(@Param("imprimeCodes") List<String> imprimeCodes);


    @Query(value = "SELECT a FROM FichierEntity a WHERE " +
            " ((:codeEnv) IS NULL OR a.id.codeEnv = (:codeEnv)) " +
            " and ((:codeOrg) IS NULL OR a.id.codeOrg = (:codeOrg)) " +
            " and ((:codeApp) IS NULL OR a.id.codeApp = (:codeApp)) " +
            " and ((:codeCom) IS NULL OR a.id.codeCom = (:codeCom)) " +
            " and ((:codeFic) IS NULL OR a.id.codeFich = (:codeFic)) " +
            " and ((:refImprime) IS NULL OR a.refImprime like (:refImprime)) " +
            " and (a.codeAdr is null or a.codeAdr = '') "
    )
    List<FichierEntity> findFichiersForAdsNull(@Param("codeEnv") String codeEnv, @Param("codeOrg") String codeOrg,
                                               @Param("codeApp") String codeApp,@Param("codeCom") String codeCom,
                                               @Param("codeFic") String codeFic, @Param("refImprime") String refImprime);


    @Query(value = "SELECT a FROM FichierEntity a WHERE " +
            " ((:codeEnv) IS NULL OR a.id.codeEnv in (:codeEnv)) " +
            " and ((:codeApp) IS NULL OR a.id.codeApp = (:codeApp)) " +
            " and ((:codeCom) IS NULL OR a.id.codeCom = (:codeCom)) " +
            " and ((:codeFic) IS NULL OR a.id.codeFich = (:codeFic)) "
    )
    List<FichierEntity> getExistedFichiers(@Param("codeEnv") List<String> codeEnv, @Param("codeApp") String codeApp,
                                           @Param("codeCom") String codeCom, @Param("codeFic") String codeFice);

    @Query(value = "SELECT new fr.acoss.posdoc.domain.fichier.model.EnvAppRefImpInFichier(a.id.codeEnv, a.id.codeApp, a.refImprime) " +
            " FROM FichierEntity a " +
            " WHERE a.refImprime != '' AND a.refImprime is not null " +
            " GROUP BY a.id.codeEnv, a.id.codeApp, a.refImprime " +
            " ORDER BY a.id.codeEnv, a.id.codeApp, a.refImprime "
    )
    List<EnvAppRefImpInFichier> findEnvAppRefImpEnGroup();

    @Query("select distinct f.id.codeEnv from FichierEntity f order by f.id.codeEnv")
    List<String> getDistinctEnvironnement();

    @Query("select distinct f.id.codeOrg from FichierEntity f " +
           "WHERE f.id.codeEnv in :#{#query.codenvs} " +
           "ORDER BY f.id.codeOrg")
    List<String> findDistOrgByEnv(@Param("query") SearchFichierFilterQuery query);

    @Query("select distinct f.id.codeApp from FichierEntity f " +
            "where f.id.codeEnv in :#{#query.codenvs} and  f.id.codeOrg in :#{#query.codorgs} " +
            "order by f.id.codeApp")
    List<String> findDistAppByEnvOrg(@Param("query") SearchFichierFilterQuery query);

    @Query("select distinct f.id.codeCom from FichierEntity f " +
            "where f.id.codeEnv in :#{#query.codenvs} and  f.id.codeOrg in :#{#query.codorgs} and f.id.codeApp = :#{#query.codapp} " +
            "order by f.id.codeCom")
    List<String> findDistComByEnvOrgApp(@Param("query") SearchFichierFilterQuery query);

    @Query("SELECT DISTINCT f.id.codeFich FROM FichierEntity f " +
            "WHERE f.id.codeEnv IN :#{#query.codenvs} AND f.id.codeOrg in :#{#query.codorgs} AND f.id.codeApp = :#{#query.codapp} AND f.id.codeCom = :#{#query.codcom} " +
            "ORDER BY f.id.codeFich")
    List<String> findDistFicByEnvOrgAppCom(@Param("query") SearchFichierFilterQuery query);


    @Query(value = "SELECT new fr.acoss.posdoc.domain.fichier.model.Fichier(a.id.codeEnv, a.id.codeOrg," +
            "a.id.codeApp, a.id.codeCom, a.id.codeFich, a.libFichier, a.refImprime, a.codeAdr, a.codeProd, " +
            "a.refFormat, a.typeFormat, a.page, a.codeClient, a.typeSig, a.typeMultif, a.typeSupport, a.refSupport, a.eclatement, a.codeDocument, " +
            "(CASE WHEN EXISTS (SELECT 1 FROM ProduiEntity p " +
            "                    WHERE p.id.codapp = a.id.codeApp " +
            "                      AND p.id.codenv = a.id.codeEnv " +
            "                      AND p.id.codorg = a.id.codeOrg " +
            "                      AND p.id.codcom = a.id.codeCom " +
            "                      AND p.id.codfic = a.id.codeFich) " +
            "      THEN true ELSE false END)) " +
            "FROM FichierEntity a " +
            "WHERE a.id.codeEnv in :#{#query.codenvs} " +
            "AND a.id.codeOrg in :#{#query.codorgs} " +
            "AND ((:#{#query.codapp}) IS NULL OR a.id.codeApp IN (:#{#query.codapp})) " +
            "AND ((:#{#query.codcom}) IS NULL OR a.id.codeCom IN (:#{#query.codcom})) " +
            "AND ((:#{#query.codfic}) IS NULL OR a.id.codeFich IN (:#{#query.codfic})) " +
            "ORDER BY a.id.codeCom, a.id.codeFich, a.id.codeEnv, a.id.codeOrg, a.id.codeApp ASC ")
    List<Fichier> findPreselectedFichier(@Param("query") SearchFichierFilterQuery query);

    @Query("select new fr.acoss.posdoc.domain.fichier.model.ComFichProdInFichier(f.id.codeCom, f.id.codeFich, f.codeProd) " +
            " from FichierEntity f " +
            " group by f.id.codeCom, f.id.codeFich, f.codeProd " +
            " order by f.id.codeCom asc, f.id.codeFich asc, f.codeProd asc")
    List<ComFichProdInFichier> getAllDistinctCodComCodFicCodPrd();


    @Query(value = "SELECT distinct new fr.acoss.posdoc.domain.fichier.model.EnvDocImpInFichier(a.codeDocument, a.id.codeEnv)  FROM FichierEntity a WHERE " +
            " ((:codeOrg) IS NULL OR a.id.codeOrg = (:codeOrg))" +
            " and ((:codeApp) IS NULL OR a.id.codeApp = (:codeApp))" +
            " ORDER BY a.codeDocument DESC  ")
    List<EnvDocImpInFichier> findFichiersByAppAndOrg(@Param("codeOrg") String codeOrg, @Param("codeApp") String codeApp);

    @Query(value = "SELECT a.id.codeOrg FROM FichierEntity a " +
            " WHERE a.id.codeEnv = (:#{#query.codeEnv}) " +
            " AND a.id.codeApp = (:#{#query.codeApp}) " +
            " AND a.id.codeCom = (:#{#query.codeCom}) " +
            " AND a.id.codeFich IN (:#{#query.codesFic}) "
    )
    List<String> getOrgByEnvAppComFics(@Param("query") SearchOrgByEnvAppComFicsQuery query);

    @QueryLog(entity = "FichierEntity", action = MyslogAction.UPDATE)
    @Transactional
    @Modifying
    @Query(value = "UPDATE FichierEntity f SET f.ficAtt = (:message) " +
            " WHERE f.id.codeEnv = (:#{#query.codenv}) " +
            " AND f.id.codeOrg IN (:#{#query.codorgs}) " +
            " AND f.id.codeApp = (:#{#query.codapp}) " +
            " AND f.id.codeCom = (:#{#query.codcom}) " +
            " AND f.id.codeFich IN (:#{#query.codfics}) "
    )
    void updateFicAttByEnvOrgsAppComFics(@Param("query") EnvOrgsAppComFicsQuery query, @Param("message") String message);

    @Query(value = "SELECT a.id.codeEnv as codenv, a.id.codeOrg as codorg, a.id.codeApp as codapp, a.id.codeCom as codcom, " +
            " a.id.codeFich as codfic, a.codeProd as codprd, a.refImprime as refimp " +
            " FROM FichierEntity a WHERE " +
            " a.id.codeEnv = (:#{#query.codenv}) " +
            " and a.id.codeOrg in (:#{#query.codorg}) " +
            " and a.id.codeApp = (:#{#query.codapp}) " +
            " and ((:#{#query.codcom}) IS NULL OR a.id.codeCom like (:#{#query.codcom})) " +
            " and ((:#{#query.codfic}) IS NULL OR a.id.codeFich IN (:#{#query.codfic})) " +
            " and ((:#{#query.refimp}) IS NULL OR a.refImprime like (:#{#query.refimp})) " +
            " order by a.id.codeEnv, a.id.codeOrg, a.id.codeApp, a.id.codeFich "
    )
    List<Map<String, String>> findFichiersForAffectationNotice(@Param("query") SearchNotficQuery query);

    @Query("select distinct f.id.codeOrg from FichierEntity f " +
            "WHERE f.id.codeEnv in (:#{#query.codenvs}) and f.id.codeOrg not in (:#{#codmasorgs}) " +
            "ORDER BY f.id.codeOrg")
    List<String> findDistOrgNoMasByEnv(@Param("query") SearchFichierFilterQuery query, @Param("codmasorgs") List<String> codmasorgs);

    @Query("select f.id.codeCom as codcom, f.codeDocument as coddoc, f.libFichier as libfic from FichierEntity f " +
            "WHERE f.id.codeOrg = (:#{#docOrg}) and f.id.codeApp = (:#{#docApp}) " +
            "ORDER BY f.id.codeCom, f.codeDocument, f.libFichier")
    List<Map<String, String>> findComDocLibFicInFichier(@Param("docApp") String docApp, @Param("docOrg") String docOrg);

    @Query("SELECT DISTINCT f.id.codeFich as codfic, f.refImprime as refimp, f.codeProd as codprd " +
            " FROM FichierEntity f " +
            " WHERE f.id.codeEnv = (:#{#query.codenv}) " +
            " AND f.id.codeOrg in (:#{#query.codorgs}) " +
            " AND f.id.codeApp = (:#{#query.codapp}) " +
            " AND f.id.codeCom like (:#{#query.codcom}) " +
            " ORDER BY f.id.codeFich "
    )
    List<Map<String, String>> findFicPrdImpByEnvOrgAppCom(@Param("query") SearchByEnvOrgsAppComQuery query);
}
