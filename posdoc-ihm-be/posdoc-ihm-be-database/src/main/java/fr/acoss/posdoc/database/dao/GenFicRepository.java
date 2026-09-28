package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenFicCompositeId;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.SearchBonTravailManuelQuery;
import fr.acoss.posdoc.domain.expedition.model.SearchExpeditionQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierDTO;
import fr.acoss.posdoc.domain.genfic.model.EnvOrg;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import fr.acoss.posdoc.domain.genfic.model.Facturation;
import fr.acoss.posdoc.domain.genfic.model.OccurrencesFichiersFiltersInput;
import fr.acoss.posdoc.domain.genfic.model.ReeditionMassification;
import fr.acoss.posdoc.domain.genfic.model.ReeditionProduit;
import fr.acoss.posdoc.domain.genfic.model.ReeditionRessource;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicQuery;
import fr.acoss.posdoc.domain.genfic.model.query.SearchReeditionParMassificationQuery;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static fr.acoss.posdoc.types.Constantes.FICSTA_T;
import static fr.acoss.posdoc.types.TypeEtape.TYPETP_DIS;

@Repository
public interface GenFicRepository extends GenericRepository<GenFicEntity, GenFicCompositeId> {
    String SELECT_CONSOLIDATION_FACTURATION = "SELECT CAST(gt.c45_codenv as varchar) as codenv, gt.c45_codorg as codorg, gt.c45_codapp as codapp, gt.c45_percod as percod, " +
        "gt.c45_codcom as codcom, gt.c45_codfic as codfic, gt.c45_numcom as numcom, gf.s15_codprd as codprd, " +
        "gf.s15_codcli as codcli, CAST(gf.n15_plific as varchar) as plific, CAST(gf.d15_dfiexp as varchar) as dfiexp, " +
        "STRING_AGG(gt.c45_typtar, ',') as typtar, STRING_AGG(CAST(gt.n45_nbplis as varchar), ',') as nbplis," +
        "STRING_AGG(CAST(gt.n45_coutot as varchar), ',') as coutot, " +
        "STRING_AGG(CAST(t.b43_compta as varchar), ',') as compta, " +
        "gf.s15_codsit as codsit, STRING_AGG(CAST(t.b43_perime as varchar), ',') as perime ";
    String GROUP_BY_ORDER_BY_CONSOLIDATION_FACTURATION = "GROUP BY codenv, codorg, codapp, percod, codcom, codfic, numcom, codprd, codcli, plific, dfiexp, codsit " +
            "ORDER BY codenv, codorg, codapp, percod, codcom, codfic, numcom, typtar";

    String FIND_OCCURRENCES_FICHIERS_SELECT_COUNT = "SELECT COUNT(gf) ";
    String FIND_OCCURRENCES_FICHIERS_SELECT = "SELECT gf ";
    String FIND_OCCURRENCES_FICHIERS_FROM = "FROM GenFicEntity gf " +
            "INNER JOIN OrganismeEntity o ON gf.id.codorg = o.code ";
    String FIND_OCCURRENCES_FICHIERS_WHERE = "WHERE gf.id.codenv = :#{#filtersPayload.codenv} " +
            "AND ((:#{#filtersPayload.codorg}) IS NULL OR gf.id.codorg IN (:#{#filtersPayload.codorg})) " +
            "AND (:#{#filtersPayload.codapp} IS NULL OR gf.id.codapp = :#{#filtersPayload.codapp}) " +
            "AND (:#{#filtersPayload.percod} IS NULL OR gf.id.percod = :#{#filtersPayload.percod}) " +
            "AND (:#{#filtersPayload.codcom} IS NULL OR gf.id.codcom LIKE :#{#filtersPayload.codcom}) " +
            "AND (:#{#filtersPayload.codfic} IS NULL OR gf.id.codfic LIKE :#{#filtersPayload.codfic}) " +
            "AND (:#{#filtersPayload.codprd} IS NULL OR gf.codprd LIKE :#{#filtersPayload.codprd}) " +
            "AND (:#{#filtersPayload.codsta} IS NULL OR gf.ficsta = :#{#filtersPayload.codsta}) " +
            "AND (:#{#filtersPayload.refimp} IS NULL OR gf.refimp LIKE :#{#filtersPayload.refimp}) ";
    String FIND_OCCURRENCES_FICHIERS_ORDER_BY= "ORDER BY gf.id.codenv, gf.id.codorg, gf.id.codapp, gf.id.percod, gf.id.codcom, gf.id.codfic";
    String FIND_OCCURRENCES_FICHIERS_ALL = FIND_OCCURRENCES_FICHIERS_SELECT+FIND_OCCURRENCES_FICHIERS_FROM+FIND_OCCURRENCES_FICHIERS_WHERE+FIND_OCCURRENCES_FICHIERS_ORDER_BY;
    String FIND_OCCURRENCES_FICHIERS_COUNT = FIND_OCCURRENCES_FICHIERS_SELECT_COUNT+FIND_OCCURRENCES_FICHIERS_FROM+FIND_OCCURRENCES_FICHIERS_WHERE;

    @Query("SELECT p.value FROM ParametreEntity p WHERE p.code = 'MASAPP'")
    String findValueByCodeMASAPP();

    @Query(
            "SELECT DISTINCT genfic.id.codenv as codenv, genfic.id.codorg as codorg, genfic.id.codapp as codapp, genfic.id.percod as percod, genfic.id.codcom as codcom, genfic.id.codfic as codfic, " +
                    "genfic.id.numcom as numcom, genfic.codprd as codprd, genfic.refimp as refimp, CAST(genfic.pagfic AS string) as pagfic, CAST(genfic.dfiexp as string) as dfiexp, genfic.codsit as codsit, genfic.codcli as codcli, genfic.libfic as libfic " +
                    "FROM GenFicEntity genfic " +
                    "INNER JOIN GenTarEntity gentar ON genfic.id.codfic = gentar.id.c45Codfic AND genfic.id.numcom = gentar.id.c45Numcom AND genfic.id.codcom = gentar.id.c45Codcom " +
                    "AND genfic.id.percod = gentar.id.c45Percod AND genfic.id.codapp = gentar.id.c45Codapp AND genfic.id.codorg = gentar.id.c45Codorg AND genfic.id.codenv = gentar.id.c45Codenv " +
                    "WHERE genfic.id.codenv = :#{#query.codenv} " +
                    "AND genfic.id.codorg IN (:#{#query.codorg}) " +
                    "AND genfic.id.codapp = :#{#query.codapp} " +
                    "AND (:#{#query.codcom} IS NULL OR genfic.id.codcom LIKE :#{#query.codcom})" +
                    "AND (:#{#query.codfic} IS NULL OR genfic.id.codfic LIKE :#{#query.codfic})" +
                    "AND (:#{#query.codcli} IS NULL OR genfic.codcli LIKE :#{#query.codcli})" +
                    "AND (:#{#query.percod} IS NULL OR genfic.id.percod LIKE :#{#query.percod})" +
                    "AND (:#{#query.codsit} IS NULL OR genfic.codsit LIKE :#{#query.codsit})" +
                    "AND (:#{#query.dfiexpDeb} IS NULL OR genfic.dfiexp >= TO_DATE(:#{#query.dfiexpDeb}, 'YYMMDD'))" +
                    "AND (:#{#query.dfiexpFin} IS NULL OR genfic.dfiexp <= TO_DATE(:#{#query.dfiexpFin}, 'YYMMDD'))" +
                    "AND ((:#{#query.isNotNullDfiexp} = TRUE AND genfic.dfiexp IS NULL) OR (:#{#query.isNotNullDfiexp} = FALSE))" +
                    "ORDER BY genfic.id.codenv, genfic.id.codorg, genfic.id.codapp, genfic.id.percod, genfic.id.codcom, genfic.id.codfic"
    )
    List<Map<String, String>> findGenficInnerJoinGentar(@Param("query") SearchExpeditionQuery query);

    @Query(" SELECT DISTINCT new fr.acoss.posdoc.domain.genfic.model.EnvOrgApp(gf.id.codenv, gf.id.codorg, gf.id.codapp) " +
            " from GenFicEntity gf  ")
    List<EnvOrgApp> distinctEnvOrgApp();

    @Query("SELECT DISTINCT new fr.acoss.posdoc.domain.genfic.model.EnvOrg(gf.id.codenv, gf.id.codorg) " +
            "FROM GenFicEntity gf " +
            "JOIN SiteCNPEntity sc ON gf.id.codorg = sc.organismeMassification " +
            "WHERE gf.id.percod IS NOT NULL")
    List<EnvOrg> distinctEnvOrgWithMasorgAndPeriode();

    @Query(" SELECT DISTINCT gf.id.percod " +
            " from GenFicEntity gf " +
            " WHERE gf.id.codenv = :codenv " +
            "AND gf.id.codorg IN :codorg " +
            "AND (:codapp IS NULL OR gf.id.codapp = :codapp ) " +
            "ORDER BY gf.id.percod DESC")
    List<String> getPeriodeFromGenfic(@Param("codenv") String codenv, @Param("codorg") List<String> codorg, @Param("codapp") String codapp);

    @Query(" SELECT DISTINCT gf.id.codcom " +
            " from GenFicEntity gf " +
            " WHERE gf.id.codenv = :codenv " +
            "AND gf.id.codorg IN :codorg " +
            "AND gf.id.percod = :percod " +
            "ORDER BY gf.id.codcom ASC")
    List<String> getCommandeFromGenfic(@Param("codenv") String codenv, @Param("codorg") List<String> codorg, @Param("percod") String periode);

    @Query(" SELECT DISTINCT gf.id.codcom " +
            " from GenFicEntity gf " +
            " WHERE gf.id.codenv = :codenv " +
            "AND gf.id.codorg IN :codorg " +
            "AND gf.id.codapp = :codapp " +
            "AND gf.id.percod = :percod " +
            "ORDER BY gf.id.codcom ASC")
    List<String> getCommandeFromGenficWithApp(@Param("codenv") String codenv, @Param("codorg") List<String> codorg, @Param("codapp") String codapp, @Param("percod") String periode);

    @Query(" SELECT DISTINCT gf.id.codfic " +
            " from GenFicEntity gf " +
            " WHERE gf.id.codenv = :codenv " +
            "AND gf.id.codorg IN :codorg " +
            "AND gf.id.percod = :percod " +
            "AND gf.id.codcom = :codcom " +
            "ORDER BY gf.id.codfic ASC")
    List<String> getFichierFromGenfic(@Param("codenv") String codenv, @Param("codorg") List<String> codorg, @Param("percod") String periode, @Param("codcom") String codcom);

    @Query(" SELECT DISTINCT gf.id.codfic " +
            " from GenFicEntity gf " +
            " WHERE gf.id.codenv = :codenv " +
            "AND gf.id.codorg IN :codorg " +
            "AND gf.id.codapp = :codapp " +
            "AND gf.id.percod = :percod " +
            "AND gf.id.codcom = :codcom " +
            "ORDER BY gf.id.codfic ASC")
    List<String> getFichierFromGenficWithApp(@Param("codenv") String codenv, @Param("codorg") List<String> codorg, @Param("codapp") String codapp, @Param("percod") String periode, @Param("codcom") String codcom);

    @Query("SELECT new fr.acoss.posdoc.domain.genfic.model.ReeditionRessource(gf.id.percod, ge.codsit, ge.codres, ge.codgam, gf.id.codcom, gf.id.codfic, gf.id.numcom, gf.codprd, gf.refimp, gp.pagFic, ge.coddes, ge.nbrexe, gf.libfic, gf.id.codorg,ge.reedit) FROM GenFicEntity gf " +
            "LEFT JOIN GenProEntity gp ON gf.id.numcom = gp.id.numCom AND gf.id.codfic = gp.id.codeFic AND gf.id.codcom = gp.id.codeCom AND gf.id.percod = gp.id.perCod AND gf.id.codapp = gp.id.codeApp AND gf.id.codorg = gp.id.codeOrg AND gf.id.codenv = gp.id.codeEnv " +
            "LEFT JOIN GenEtpEntity ge ON ge.codgam = gp.id.codeGam AND ge.numcom = gp.id.numCom AND ge.codfic = gp.id.codeFic AND ge.id.codcom = gp.id.codeCom AND ge.percod = gp.id.perCod AND ge.codapp = gp.id.codeApp AND ge.codorg = gp.id.codeOrg AND ge.codenv = gp.id.codeEnv " +
            "WHERE ge.typetp = '"+TYPETP_DIS+"' AND gf.id.codenv=:codenv AND gf.id.codorg in :codorg AND gf.id.codapp= :codapp and gf.id.percod= :periode " +
            "GROUP BY gf.id.percod, ge.codsit, ge.codres, ge.codgam, gf.id.codcom, gf.id.codfic, gf.id.numcom, gf.codprd, gf.refimp, gp.pagFic, ge.coddes, ge.nbrexe, gf.libfic, gf.id.codorg,ge.reedit " +
            "ORDER BY ge.codsit, ge.codres, ge.codgam, gf.id.codcom, gf.id.codfic, gf.id.numcom ")
    List<ReeditionRessource> searchReeditionPerRessurce(@Param("codenv") String codenv, @Param("codorg") List<String> codorg, @Param("codapp") String codapp, @Param("periode") String periode);

    @Query("SELECT  new fr.acoss.posdoc.domain.genfic.model.ReeditionMassification(" +
            " Genfic.id.codcom, Genfic.id.codfic, Genfic.id.numcom, Genfic.pagfic, Genfic.plific, Genfic.libfic,  " +
            " Genfic1.id.codenv, Genfic1.id.codorg, Genfic1.id.codapp, " +
            " Genfic1.id.percod, Genfic1.id.codcom, Genfic1.id.codfic,  " +
            " Genfic1.id.numcom, Genpro.pagFic, Genpro.pliFic, Genfic1.libfic, " +
            " Genfic1.codcli, Exempl.codsit, Exempl.codres,Exempl.coddes, Exempl.nbrexe )"+
            " FROM GenFicEntity Genfic1 " +
            " INNER JOIN GenMasEntity Genmas " +
            " ON Genfic1.id.codfic = Genmas.id.codfic " +
            " AND Genfic1.id.numcom = Genmas.id.numcom AND Genfic1.id.codcom = Genmas.id.codcom " +
            " AND Genfic1.id.percod = Genmas.id.percod AND Genfic1.id.codapp = Genmas.id.codapp " +
            " AND Genfic1.id.codorg = Genmas.id.codorg AND Genfic1.id.codenv = Genmas.id.codenv " +
            " INNER JOIN GenFicEntity Genfic " +
            " ON Genfic.id.codfic = Genmas.id.masfic " +
            " AND Genfic.id.numcom = Genmas.id.masnum AND Genfic.id.codcom = Genmas.id.mascom " +
            " AND Genfic.id.codorg = Genmas.id.masorg AND Genfic.id.percod = Genmas.id.masper " +
            " AND Genfic.id.codapp = Genmas.id.masapp AND Genfic.id.codenv = Genmas.id.masenv " +
            " INNER JOIN ExemplaireEntity Exempl " +
            " ON Genfic1.id.codfic = Exempl.id.codfic " +
            " AND Genfic1.id.codcom = Exempl.id.codcom AND Genfic1.id.codapp = Exempl.id.codapp " +
            " AND Genfic1.id.codorg = Exempl.id.codorg AND Genfic1.id.codenv = Exempl.id.codenv " +
            " INNER JOIN GenProEntity Genpro " +
            " ON Genpro.id.codeFic = Genmas.id.codfic " +
            " AND Genpro.id.numCom = Genmas.id.numcom AND Genpro.id.codeCom = Genmas.id.codcom " +
            " AND Genpro.id.codeOrg = Genmas.id.codorg AND Genpro.id.perCod = Genmas.id.percod " +
            " AND Genpro.id.codeApp = Genmas.id.codapp AND Genpro.id.codeEnv = Genmas.id.codenv " +
            " WHERE " +
            " Genfic.id.codapp = :#{#query.masapp} AND Exempl.id.codgam = :#{#query.masgam} AND Genpro.id.codeGam = :#{#query.masgam} " +
            " AND Genfic.id.codenv=:#{#query.codenv} AND Genfic.id.codorg in (:#{#query.codorg}) AND Genfic.id.percod = :#{#query.periode} " +
            " AND (:#{#query.codcom} IS NULL OR Genfic.id.codcom = :#{#query.codcom}) AND (:#{#query.codfic} IS NULL OR Genfic.id.codfic = :#{#query.codfic})"+
            " ORDER BY " +
            " Genfic.id.codcom, Genfic.id.codfic, Genfic.id.numcom, Genfic1.id.codorg,Genfic1.id.percod, Genfic1.id.codcom, Genfic1.id.numcom, Genfic1.id.codfic "
    )
    List<ReeditionMassification> searchReeditionParMassification(@Param("query") SearchReeditionParMassificationQuery searchReeditionQuery);

    @Query("SELECT  new fr.acoss.posdoc.domain.genfic.model.ReeditionProduit(" +
            " Genfic.id.codcom, Genfic.id.codfic, Genfic.id.numcom, Genfic.refimp, Genfic.codprd, Genfic.libfic, Genpro.pagFic, Genetp.codgam, " +
            " Genetp.codsit, Genetp.codres, Genetp.coddes, Genetp.nbrexe, Genfic.id.codorg, Genfic.id.percod, Genetp.reedit) " +
            " FROM GenFicEntity Genfic " +
            " LEFT JOIN GenProEntity Genpro ON Genpro.id.codeFic = Genfic.id.codfic AND Genpro.id.numCom = Genfic.id.numcom AND Genpro.id.codeCom = Genfic.id.codcom AND Genpro.id.perCod = Genfic.id.percod AND Genpro.id.codeApp = Genfic.id.codapp AND Genpro.id.codeOrg = Genfic.id.codorg AND Genpro.id.codeEnv = Genfic.id.codenv " +
            " LEFT JOIN GenEtpEntity Genetp ON Genetp.codgam = Genpro.id.codeGam AND Genetp.numcom = Genpro.id.numCom AND Genetp.codfic = Genpro.id.codeFic AND Genetp.codcom = Genpro.id.codeCom AND Genetp.percod = Genpro.id.perCod AND Genetp.codapp = Genpro.id.codeApp AND Genetp.codorg = Genpro.id.codeOrg AND Genetp.codenv = Genpro.id.codeEnv " +
            " INNER JOIN OrganismeEntity Organisme ON Organisme.code = Genfic.id.codorg " +
            " WHERE Genfic.id.codenv = :codenv " +
            " AND Genetp.typetp = '"+TYPETP_DIS+"' " +
            " AND Genfic.id.codorg IN (:codorg) " +
            " AND Genfic.id.codapp = :application " +
            " AND Genfic.id.percod = :periode " +
            " AND (:codcom IS NULL OR Genfic.id.codcom = :codcom) " +
            " AND (:codfic IS NULL OR Genfic.id.codfic = :codfic) " +
            " GROUP BY Genfic.id.codcom, Genfic.id.codfic, Genfic.id.numcom, Genfic.refimp, Genfic.codprd, Genfic.libfic, Genpro.pagFic, Genetp.codgam, Genetp.codsit, Genetp.codres, Genetp.coddes, Genetp.nbrexe, Genfic.id.codorg, Genfic.id.percod, Genetp.reedit"+
            " ORDER BY Genfic.id.codcom, Genfic.id.codfic, Genfic.id.numcom, Genfic.id.codorg "
    )
    List<ReeditionProduit> searchReeditionPerProduit(@Param("codenv") String codenv, @Param("codorg") List<String> codorg,
                                                     @Param("application") String application, @Param("periode") String periode, @Param("codcom") String codcom, @Param("codfic") String codfic);

    @Query("SELECT DISTINCT sc.organismeMassification " +
            "FROM SiteCNPEntity sc " +
            "JOIN GenFicEntity gf ON sc.organismeMassification = gf.id.codorg " +
            "WHERE gf.id.percod IS NOT NULL " +
            "ORDER BY sc.organismeMassification")
    List<String> getOrganismeMassificationWithPeriods();

    @Query("SELECT DISTINCT genfic.id.codapp FROM GenFicEntity genfic WHERE genfic.id.codenv = :env AND genfic.id.codorg IN (:orgs) ORDER BY genfic.id.codapp")
    List<String> getApplicationsByEnvAndOrgs(@Param("env") String env, @Param("orgs") List<String> orgs);

    @Query("SELECT new fr.acoss.posdoc.domain.genfic.model.Facturation(" +
            " gentar.id.c45Codcom, gentar.id.c45Codfic, gentar.id.c45Numcom, genfic.codprd, genfic.codcli, " +
            " gentar.id.c45Typtar, gentar.n45Nbplis, gentar.n45Coutot, genfic.dfiexp, " +
            " gentar.id.c45Codenv, gentar.id.c45Codorg, gentar.id.c45Codapp, gentar.id.c45Percod) " +
            " FROM GenFicEntity genfic " +
            " INNER JOIN GenMasEntity genmas ON genfic.id.codfic = genmas.id.codfic " +
            " AND genfic.id.numcom = genmas.id.numcom AND genfic.id.codcom = genmas.id.codcom " +
            " AND genfic.id.percod = genmas.id.percod AND genfic.id.codapp = genmas.id.codapp " +
            " AND genfic.id.codorg = genmas.id.codorg AND genfic.id.codenv = genmas.id.codenv " +
            " INNER JOIN GenTarEntity gentar ON " +
            " genfic.id.codfic = gentar.id.c45Codfic AND genfic.id.numcom = gentar.id.c45Numcom AND " +
            " genfic.id.codcom = gentar.id.c45Codcom AND genfic.id.codenv = gentar.id.c45Codenv AND " +
            " genfic.id.codorg = gentar.id.c45Codorg AND genfic.id.codapp = gentar.id.c45Codapp AND " +
            " genfic.id.percod = gentar.id.c45Percod " +
            " WHERE genmas.id.masenv = :codenv AND genmas.id.masorg = :codorg " +
            " AND genmas.id.masapp = :codapp AND genmas.id.masper = :percod " +
            " ORDER BY gentar.id.c45Codenv, gentar.id.c45Codorg, gentar.id.c45Codapp, gentar.id.c45Percod, " +
            " gentar.id.c45Codcom, gentar.id.c45Codfic, gentar.id.c45Numcom, gentar.id.c45Typtar")
    List<Facturation> getFacturationMAS(@Param("codenv") String codenv, @Param("codorg") String codorg, @Param("codapp") String codapp, @Param("percod") String percod);

    @Query("SELECT new fr.acoss.posdoc.domain.genfic.model.Facturation(" +
            " gentar.id.c45Codcom, gentar.id.c45Codfic, gentar.id.c45Numcom, genfic.codprd, genfic.codcli, " +
            " gentar.id.c45Typtar, gentar.n45Nbplis, gentar.n45Coutot, genfic.dfiexp, " +
            " gentar.id.c45Codenv, gentar.id.c45Codorg, gentar.id.c45Codapp, gentar.id.c45Percod) " +
            " FROM GenFicEntity genfic " +
            " INNER JOIN GenTarEntity gentar ON " +
            " genfic.id.codfic = gentar.id.c45Codfic AND genfic.id.numcom = gentar.id.c45Numcom AND " +
            " genfic.id.codcom = gentar.id.c45Codcom AND genfic.id.codenv = gentar.id.c45Codenv AND " +
            " genfic.id.codorg = gentar.id.c45Codorg AND genfic.id.codapp = gentar.id.c45Codapp AND " +
            " genfic.id.percod = gentar.id.c45Percod " +
            " WHERE gentar.id.c45Codenv = :codenv AND gentar.id.c45Codorg = :codorg " +
            " AND gentar.id.c45Codapp = :codapp AND gentar.id.c45Percod = :percod " +
            " ORDER BY gentar.id.c45Codenv, gentar.id.c45Codorg, gentar.id.c45Codapp, gentar.id.c45Percod, " +
            " gentar.id.c45Codcom, gentar.id.c45Codfic, gentar.id.c45Numcom, gentar.id.c45Typtar")
    List<Facturation> getFacturation(@Param("codenv") String codenv, @Param("codorg") String codorg, @Param("codapp") String codapp, @Param("percod") String percod);

    @QueryLog(entity ="GenFicEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenFicEntity genfic SET " +
            " genfic.ficsta = '"+FICSTA_T+"', " +
            " genfic.dficht = now() " +
            " WHERE " +
            " genfic.id.codenv = :codenv AND " +
            " genfic.id.codorg = :codorg AND " +
            " genfic.id.codapp = :codapp AND " +
            " genfic.id.percod = :percod")
    void termineGenFic(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod
    );

    @Query("SELECT new fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierDTO(" +
            " genfic.id.codenv, genfic.id.codorg, genfic.id.codapp, genfic.id.percod, genfic.id.codcom, genfic.id.codfic, genfic.id.numcom, " +
            " genfic.libfic, genfic.refimp, genfic.codcli, genfic.dfiexp, genfic.pagfic, genfic.plific, genfic.rejfic) " +
            "FROM GenFicEntity genfic " +
            "WHERE genfic.id.codenv = :codenv AND genfic.id.codorg = :codorg AND genfic.id.codapp = :codapp AND genfic.id.percod = :percod AND genfic.id.codcom = :codcom AND genfic.id.codfic = :codfic AND genfic.id.numcom = :numcom")
    VideoStepDetailsFichierDTO getVideoStepDetailsFichier(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod,
            @Param("codcom") String codcom,
            @Param("codfic") String codfic,
            @Param("numcom") String numcom
    );

    @Query(value = "SELECT gf.s15_codbon as codbon, CAST(gf.c15_codenv as varchar) as codenv, gf.c15_codorg as codorg, " +
            "   gf.c15_codapp as codapp, gf.c15_percod as percod, gf.c15_codcom as codcom," +
            "   gf.c15_codfic as codfic, gf.c15_numcom as numcom, CAST(gf.n15_pagfic as varchar) as pagfic, CAST(gf.n15_plific as varchar) as plific," +
            "   CAST(gf.d15_dappcr as varchar) as dappcr, CAST(gf.d15_drecep as varchar) as drecep," +
            "   CAST(gf.d15_dfiexp as varchar) as dfiexp, CAST(gf.n15_delmsp as varchar) as delmsp," +
            "   gf.s15_inform as inform, CAST(gf.n15_codpal as varchar) as codpal, gf.s15_libfic as libfic," +
            "   STRING_AGG(gn.c28_codnot, ',') as codnot, STRING_AGG(n.s26_libnot, ',') as libnot, gf.s15_codsit as codsit, s15_typtar as typtar " +
            "FROM genfic gf " +
            "LEFT JOIN gennot gn ON gf.c15_codfic = gn.c28_codfic " +
            "   AND gf.c15_numcom = gn.c28_numcom AND gf.c15_codcom = gn.c28_codcom " +
            "   AND gf.c15_percod = gn.c28_percod AND gf.c15_codapp = gn.c28_codapp " +
            "   AND gf.c15_codorg = gn.c28_codorg AND gf.c15_codenv = gn.c28_codenv " +
            "LEFT JOIN notice n ON n.c26_codnot = gn.c28_codnot " +
            "INNER JOIN organi o ON gf.c15_codorg = o.c00_codorg " +
            "INNER JOIN tarpos t ON gf.s15_typtar = t.c43_typtar " +
            " WHERE gf.c15_codenv = :#{#query.codenv} " +
            "   AND gf.c15_codorg = :#{#query.codorg} " +
            "   AND gf.c15_codapp = :#{#query.codapp} " +
            "   AND gf.c15_codcom = :#{#query.codcom} " +
            "   AND gf.c15_codfic = :#{#query.codfic} " +
            "GROUP BY codbon, codenv, codorg, codapp, percod, codcom, codfic, numcom, " +
            "   pagfic, plific, dappcr, drecep, dfiexp, delmsp, inform, codpal, libfic, codsit, typtar", nativeQuery = true)
    List<Map<String, String>> getBonTravailManuel(@Param("query") SearchBonTravailManuelQuery query);

    @QueryLog(entity = "GenFicEntity",action = MyslogAction.DELETE)
    @Modifying
    @Transactional
    @Query("DELETE FROM GenFicEntity gf " +
            "WHERE gf.id.codenv = :#{#query.codenv} " +
            "   AND gf.id.codorg = :#{#query.codorg} " +
            "   AND gf.id.codapp = :#{#query.codapp} " +
            "   AND gf.id.percod = :#{#query.percod} " +
            "   AND gf.id.numcom = :#{#query.numcom} " +
            "   AND gf.id.codcom = :#{#query.codcom} " +
            "   AND gf.id.codfic = :#{#query.codfic}")
    void deleteGenfic(@Param("query") DeleteBonTravailManuelQuery query);

    @Query("SELECT codbon FROM GenFicEntity WHERE codbon LIKE (:codbon) ORDER BY codbon DESC")
    String getCodBonByCodBon(@Param("codbon") String codbon);

    @Query(FIND_OCCURRENCES_FICHIERS_COUNT)
    Integer countOccurrencesFichiers(@Param("filtersPayload") OccurrencesFichiersFiltersInput filtersPayload);

    @Query(FIND_OCCURRENCES_FICHIERS_ALL)
    List<GenFicEntity> findOccurrencesFichiersFiltered(@Param("filtersPayload") OccurrencesFichiersFiltersInput filtersPayload);

    @Query(value = SELECT_CONSOLIDATION_FACTURATION + "FROM genfic gf " +
            "INNER JOIN gentar gt ON gf.c15_codfic = gt.c45_codfic AND" +
            "   gf.c15_numcom = gt.c45_numcom AND gf.c15_codcom = gt.c45_codcom AND" +
            "   gf.c15_codenv = gt.c45_codenv AND gf.c15_codorg = gt.c45_codorg AND" +
            "   gf.c15_codapp = gt.c45_codapp AND gf.c15_percod = gt.c45_percod " +
            "INNER JOIN tarpos t ON gt.c45_typtar = t.c43_typtar " +
            "WHERE gt.c45_codenv = :#{#query.codenv} AND gt.c45_codorg IN :#{#query.codorg} " +
            "   AND gt.c45_codapp = :#{#query.codapp}" +
            "   AND (:#{#query.percod} IS NULL OR gt.c45_percod = CAST(:#{#query.percod} as varchar)) " +
            "   AND (:#{#query.codcom} IS NULL OR gt.c45_codcom LIKE CAST(:#{#query.codcom} as varchar)) " +
            "   AND (:#{#query.codfic} IS NULL OR gt.c45_codfic LIKE CAST(:#{#query.codfic} as varchar)) " +
            "   AND (:#{#query.codsit} IS NULL OR gf.s15_codsit = CAST(:#{#query.codsit} as varchar)) " +
            GROUP_BY_ORDER_BY_CONSOLIDATION_FACTURATION, nativeQuery = true)
    List<Map<String, String>> getConsolidationFacturation(@Param("query") SearchConsolidationFacturationQuery query);

    @Query(value = SELECT_CONSOLIDATION_FACTURATION + "FROM genmas gm " +
            "INNER JOIN genfic gf ON gf.c15_codfic = gm.c31_codfic AND " +
            "   gf.c15_numcom = gm.c31_numcom AND gf.c15_codcom = gm.c31_codcom AND " +
            "   gf.c15_codenv = gm.c31_codenv AND gf.c15_codorg = gm.c31_codorg AND " +
            "   gf.c15_codapp = gm.c31_codapp AND gf.c15_percod = gm.c31_percod " +
            "INNER JOIN gentar gt ON gf.c15_codfic = gt.c45_codfic AND" +
            "   gf.c15_numcom = gt.c45_numcom AND gf.c15_codcom = gt.c45_codcom AND" +
            "   gf.c15_codenv = gt.c45_codenv AND gf.c15_codorg = gt.c45_codorg AND" +
            "   gf.c15_codapp = gt.c45_codapp AND gf.c15_percod = gt.c45_percod " +
            "INNER JOIN tarpos t ON gt.c45_typtar = t.c43_typtar " +
            "WHERE gm.c31_masenv = :#{#query.codenv} AND gm.c31_masorg IN :#{#query.codorg} " +
            "   AND gm.c31_masapp = :#{#query.codapp} AND gm.c31_masper = :#{#query.percod} " +
            "   AND (:#{#query.codcom} IS NULL OR gm.c31_mascom LIKE CAST(:#{#query.codcom} as varchar)) " +
            "   AND (:#{#query.codfic} IS NULL OR gm.c31_masfic LIKE CAST(:#{#query.codfic} as varchar)) " +
            "   AND (:#{#query.codsit} IS NULL OR gf.s15_codsit = CAST(:#{#query.codsit} as varchar)) " +
            GROUP_BY_ORDER_BY_CONSOLIDATION_FACTURATION, nativeQuery = true)
    List<Map<String, String>> getConsolidationFacturationMasapp(@Param("query") SearchConsolidationFacturationQuery query);

    @Query(value = "SELECT gf.libfic as libfic, fm.libelle as libfor, sp.libelle as libsup, mt.libelle as libmul, " +
            " gf.reffor as reffor, gf.refimp as refimp, gf.refsup as refsup, gf.reftri as reftri, gf.refech as refech, " +
            " gf.ficatt as ficatt, gf.ficsta as ficsta, gf.maxpag as maxpag, gf.codprd as codprd, gf.repexp as repexp, " +
            " gf.typsig as typsig, gf.codcli as codcli, gf.codrnd as codrnd, gf.ficinf as ficinf, gf.dappcr as dappcr, gf.dfichd as dfichd, " +
            " gf.dficht as dficht, gf.dfichs as dfichs, gf.codsit as codsit, gf.eclate as eclate " +
            " FROM GenFicEntity gf " +
            " LEFT JOIN FormatEntity fm ON fm.code = gf.typfor " +
            " LEFT JOIN SupportEntity sp ON sp.type = gf.typsup " +
            " LEFT JOIN MultifEntity mt ON mt.code = gf.typmul " +
            " WHERE gf.id.codenv = :#{#query.codenv} " +
            " AND gf.id.codorg = :#{#query.codorg} " +
            " AND gf.id.codapp = :#{#query.codapp} " +
            " AND gf.id.percod = :#{#query.percod} " +
            " AND gf.id.codcom = :#{#query.codcom} " +
            " AND gf.id.numcom = :#{#query.numcom} " +
            " AND gf.id.codfic = :#{#query.codfic}")
    Map<String, Object> searchOccAppByFic(@Param("query") SearchOccAppByFicQuery query);


    // Cette requête est loggée manuellement (voir la méthode FacturationDetailleePersistenceImpl.logRecalculate())
    // Elle permet de recalculer le comptage plific seulement si le tarpos est comptabilisé
    @Modifying
    @Transactional
    @Query(value = "UPDATE genfic gf " +
    "SET n15_plific = COALESCE(( " +
    "    SELECT SUM(gt.n45_nbplis) " +
    "    FROM gentar gt " +
    "    JOIN tarpos tp " +
    "      ON tp.c43_typtar = gt.c45_typtar AND tp.b43_compta = 0 " +
    "    WHERE gt.c45_codenv = gf.c15_codenv " +
    "      AND gt.c45_codorg = gf.c15_codorg " +
    "      AND gt.c45_codapp = gf.c15_codapp " +
    "      AND gt.c45_percod = gf.c15_percod " +
    "      AND gt.c45_codcom = gf.c15_codcom " +
    "      AND gt.c45_numcom = gf.c15_numcom " +
    "      AND gt.c45_codfic = gf.c15_codfic " +
    "      AND gt.c45_codenv = :#{#query.codenv} " +
    "      AND gt.c45_codorg IN :#{#query.codorg} " +
    "      AND gt.c45_codapp = :#{#query.codapp} " +
    "      AND (CAST(:#{#query.percod} AS VARCHAR) IS NULL " +
    "           OR gt.c45_percod = CAST(:#{#query.percod} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL " +
    "           OR gt.c45_codcom LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL " +
    "           OR gt.c45_codfic LIKE CAST(:#{#query.codfic} AS VARCHAR)) " +
    "), 0) " +
    "WHERE gf.c15_codenv = :#{#query.codenv} " +
    "  AND gf.c15_codorg IN :#{#query.codorg} " +
    "  AND gf.c15_codapp = :#{#query.codapp} " +
    "  AND (CAST(:#{#query.percod} AS VARCHAR) IS NULL " +
    "       OR gf.c15_percod = CAST(:#{#query.percod} AS VARCHAR)) " +
    "  AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL " +
    "       OR gf.c15_codcom LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "  AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL " +
    "       OR gf.c15_codfic LIKE CAST(:#{#query.codfic} AS VARCHAR)) " +
    "  AND (CAST(:#{#query.codsit} AS VARCHAR) IS NULL " +
    "       OR gf.s15_codsit = CAST(:#{#query.codsit} AS VARCHAR))", nativeQuery = true)
    void recalculatePlific(@Param("query") SearchConsolidationFacturationQuery query);

    // Cette requête est loggée manuellement (voir la méthode FacturationDetailleePersistenceImpl.logRecalculate())
    // Elle permet de recalculer le comptage plific sur le périmètre MAS, seulement si le tarpos est comptabilisé
    @Modifying
    @Transactional
    @Query(value = "UPDATE GENFIC GF " +
    "SET N15_PLIFIC = COALESCE(( " +
    "    SELECT SUM(GT.N45_NBPLIS) " +
    "    FROM GENMAS GM " +
    "    JOIN GENTAR GT " +
    "      ON GM.C31_CODENV = GT.C45_CODENV " +
    "     AND GM.C31_CODORG = GT.C45_CODORG " +
    "     AND GM.C31_CODAPP = GT.C45_CODAPP " +
    "     AND GM.C31_PERCOD = GT.C45_PERCOD " +
    "     AND GM.C31_CODCOM = GT.C45_CODCOM " +
    "     AND GM.C31_NUMCOM = GT.C45_NUMCOM " +
    "     AND GM.C31_CODFIC = GT.C45_CODFIC " +
    "    JOIN TARPOS TP " +
    "      ON TP.C43_TYPTAR = GT.C45_TYPTAR " +
    "     AND TP.B43_COMPTA = 0 " +
    "    WHERE GT.C45_CODENV = GF.C15_CODENV " +
    "      AND GT.C45_CODORG = GF.C15_CODORG " +
    "      AND GT.C45_CODAPP = GF.C15_CODAPP " +
    "      AND GT.C45_PERCOD = GF.C15_PERCOD " +
    "      AND GT.C45_CODCOM = GF.C15_CODCOM " +
    "      AND GT.C45_NUMCOM = GF.C15_NUMCOM " +
    "      AND GT.C45_CODFIC = GF.C15_CODFIC " +
    "      AND GM.C31_MASENV = :#{#query.codenv} " +
    "      AND GM.C31_MASORG IN :#{#query.codorg} " +
    "      AND GM.C31_MASAPP = :#{#query.codapp} " +
    "      AND GM.C31_MASPER = :#{#query.percod} " +
    "      AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASCOM LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASFIC LIKE CAST(:#{#query.codfic} AS VARCHAR)) " +
    "), 0) " +
    "WHERE EXISTS ( " +
    "    SELECT 1 " +
    "    FROM GENMAS GM " +
    "    JOIN GENTAR GT " +
    "      ON GM.C31_CODENV = GT.C45_CODENV " +
    "     AND GM.C31_CODORG = GT.C45_CODORG " +
    "     AND GM.C31_CODAPP = GT.C45_CODAPP " +
    "     AND GM.C31_PERCOD = GT.C45_PERCOD " +
    "     AND GM.C31_CODCOM = GT.C45_CODCOM " +
    "     AND GM.C31_NUMCOM = GT.C45_NUMCOM " +
    "     AND GM.C31_CODFIC = GT.C45_CODFIC " +
    "    JOIN TARPOS TP " +
    "      ON TP.C43_TYPTAR = GT.C45_TYPTAR " +
    "     AND TP.B43_COMPTA = 0 " +
    "    WHERE GT.C45_CODENV = GF.C15_CODENV " +
    "      AND GT.C45_CODORG = GF.C15_CODORG " +
    "      AND GT.C45_CODAPP = GF.C15_CODAPP " +
    "      AND GT.C45_PERCOD = GF.C15_PERCOD " +
    "      AND GT.C45_CODCOM = GF.C15_CODCOM " +
    "      AND GT.C45_NUMCOM = GF.C15_NUMCOM " +
    "      AND GT.C45_CODFIC = GF.C15_CODFIC " +
    "      AND GM.C31_MASENV = :#{#query.codenv} " +
    "      AND GM.C31_MASORG IN :#{#query.codorg} " +
    "      AND GM.C31_MASAPP = :#{#query.codapp} " +
    "      AND GM.C31_MASPER = :#{#query.percod} " +
    "      AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASCOM LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASFIC LIKE CAST(:#{#query.codfic} AS VARCHAR)) " +
    ") " +
    "AND (CAST(:#{#query.codsit} AS VARCHAR) IS NULL " +
    "     OR GF.S15_CODSIT = CAST(:#{#query.codsit} AS VARCHAR))", nativeQuery = true)
    void recalculatePlificMas(@Param("query") SearchConsolidationFacturationQuery query);

    @QueryLog(entity = "GenFicEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query(value = "UPDATE GenFicEntity gf SET " +
            "   gf.plific = :nbPlis " +
            "WHERE gf.id.codenv = :#{#consolidation.codenv} " +
            "   AND gf.id.codorg = :#{#consolidation.codorg} " +
            "   AND gf.id.codapp = :#{#consolidation.codapp} " +
            "   AND gf.id.percod = :#{#consolidation.percod} " +
            "   AND gf.id.codcom = :#{#consolidation.codcom} " +
            "   AND gf.id.numcom = :#{#consolidation.numcom} " +
            "   AND gf.id.codfic = :#{#consolidation.codfic}")
    void updatePlificForConsolidationFacturation(
            @Param("consolidation") UpdateConsolidationFacturation consolidation,
            @Param("nbPlis") Integer nbPlis
    );
}
