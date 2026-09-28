package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ExemplaireCompositeId;
import fr.acoss.posdoc.database.entities.ExemplaireEntity;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByFilterQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireComposite;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireExistsQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesByExemplaireQuery;
import fr.acoss.posdoc.domain.produi.model.Produi;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;

@Repository
public interface ExemplaireRepository extends GenericRepository<ExemplaireEntity, ExemplaireCompositeId> {

    @Query("SELECT DISTINCT e.id.codenv FROM ExemplaireEntity e ORDER BY e.id.codenv")
    List<String> getDistinctEnvironnement();

    @Query("SELECT DISTINCT e.id.codorg FROM ExemplaireEntity e WHERE e.id.codenv IN (:codenvs) ORDER BY e.id.codorg")
    List<String> findDistOrgByEnv(@Param("codenvs") List<String> codenvs);

    @Query("SELECT DISTINCT e.id.codapp FROM ExemplaireEntity e " +
            "WHERE e.id.codenv IN (:codenvs) AND e.id.codorg IN (:codorgs) " +
            "ORDER BY e.id.codapp")
    List<String> findDistAppByEnvOrg(@Param("codenvs") List<String> codenvs, @Param("codorgs") List<String> codorgs);

    @Query("SELECT DISTINCT e.id.codcom FROM ExemplaireEntity e " +
            "WHERE e.id.codenv IN (:codenvs) AND  e.id.codorg IN (:codorgs) AND e.id.codapp = :codapp " +
            "ORDER BY e.id.codcom")
    List<String> findDistComByEnvOrgApp(@Param("codenvs") List<String> codenvs,
                                        @Param("codorgs") List<String> codorgs,
                                        @Param("codapp") String codapp);

    @Query("SELECT DISTINCT f.id.codeFich as codfic, f.refImprime as refImprime, f.codeProd as codeProd FROM FichierEntity f " +
            " WHERE f.id.codeEnv IN (:#{#query.codesEnv}) " +
            " AND f.id.codeOrg IN (:#{#query.codesOrg}) " +
            " AND f.id.codeApp IN (:#{#query.codesApp}) " +
            " AND f.id.codeCom IN (:#{#query.codesCom}) " +
            " ORDER BY f.id.codeFich "
    )
    List<Map<String, String>> findDistFicByEnvOrgAppCom(@Param("query") ExemplaireByFilterQuery query);

    @Query("SELECT DISTINCT e.id.codgam as codgam, e.codsit as codsit, e.codres as codres " +
            "FROM ExemplaireEntity e " +
            "WHERE e.id.codenv IN (:#{#query.codesEnv}) " +
            "   AND e.id.codorg IN (:#{#query.codesOrg}) " +
            "   AND e.id.codapp IN (:#{#query.codesApp}) " +
            "   AND e.id.codcom IN (:#{#query.codesCom}) " +
            "   AND e.id.codfic IN (:#{#query.codesFic}) " +
            "ORDER BY codgam, codres, codsit")
    List<Map<String, String>> findDistRessourceByEnvOrgAppComFic(@Param("query") ExemplaireByFilterQuery query);

    @Query(value = "SELECT " +
            " e.id.codenv as codenv, e.id.codorg as codorg, e.id.codapp as codapp, e.id.codcom as codcom, e.id.codfic as codfic, e.id.codgam as codgam, " +
            " e.id.numexe as numexe, e.codsit as codsit, e.codres as codres, e.coddes as coddes, CAST(e.nbrexe as string) as nbrexe, (CASE WHEN (e.exeact = 0) then 'false' else 'true' end) as exeact, " +
            " f.refImprime as refImprime, f.codeProd as codeProd, f.libFichier as libFichier, (CASE WHEN (r.profil IS NOT NULL) then 'true' else 'false' end) as isAdmin, f.ficAtt as ficatt" +
            " FROM ExemplaireEntity e " +
            " LEFT JOIN FichierEntity f ON " +
            " f.id.codeEnv = e.id.codenv AND " +
            " f.id.codeOrg = e.id.codorg AND f.id.codeApp = e.id.codapp AND " +
            " f.id.codeCom = e.id.codcom AND f.id.codeFich = e.id.codfic " +
            " LEFT JOIN RessourceEntity r ON r.id.codeEnvironnement = e.id.codenv AND " +
            " r.id.codeOrganisme IN (e.id.codorg, :genericOrganisme) AND r.id.codeApplication = e.id.codapp AND " +
            " r.id.codeGamme = e.id.codgam AND r.id.codeSite = e.codsit AND " +
            " r.id.codeRessource = e.codres " +
            " WHERE " +
            " ((:#{#query.codesEnv}) IS NULL OR e.id.codenv IN (:#{#query.codesEnv})) " +
            " AND ((:#{#query.codesOrg}) IS NULL OR e.id.codorg IN (:#{#query.codesOrg})) " +
            " AND ((:#{#query.codesApp}) IS NULL OR e.id.codapp IN (:#{#query.codesApp})) " +
            " AND ((:#{#query.codesCom}) IS NULL OR e.id.codcom IN (:#{#query.codesCom})) " +
            " AND ((:#{#query.codesFic}) IS NULL OR e.id.codfic IN (:#{#query.codesFic})) " +
            " ORDER BY e.id.codenv, e.id.codfic, e.id.codorg, e.id.codapp, e.id.codcom, e.id.codgam, e.codsit, e.codres"
    )
    List<Map<String, String>> findPreselectedExemplaire(@Param("query") ExemplaireByFilterQuery query, @Param("genericOrganisme") String genericOrganisme);

    @Query(value = "SELECT e FROM ExemplaireEntity e WHERE " +
                   "    ((:#{#query.codesOrg}) IS NULL OR e.id.codorg IN (:#{#query.codesOrg}))" +
                   "and ((:#{#query.codesEnv}) IS NULL OR e.id.codenv IN (:#{#query.codesEnv}))" +
                   "and ((:#{#query.codesApp}) IS NULL OR e.id.codapp IN (:#{#query.codesApp}))" +
                   "and ((:#{#query.codesSit}) IS NULL OR e.codsit IN (:#{#query.codesSit}))" +
                   "and ((:#{#query.codesCom}) IS NULL OR e.id.codcom IN (:#{#query.codesCom}))" +
                   "and ((:#{#query.codesFic}) IS NULL OR e.id.codfic IN (:#{#query.codesFic}))" +
                   "and ((:#{#query.codesGam}) IS NULL OR e.id.codgam IN (:#{#query.codesGam}))" +
                   "and ((:#{#query.codesRes}) IS NULL OR e.codres IN (:#{#query.codesRes}))" +
                   "and ((:#{#query.codesDes}) IS NULL OR e.coddes IN (:#{#query.codesDes}))"
    )
    List<ExemplaireEntity> findExemplaires(@Param("query") FindExemplaireQuery query);

    @Transactional
    void deleteByIdIn(Iterable<ExemplaireCompositeId> ids);

    // validation colonne référence
    @Query("select count(*) > 0  from ExemplaireEntity e where e.id.codorg = :codeOrganisme " +
            " AND e.coddes = :codeDestinataire ")
    boolean destinataireExistInExemplaires(@Param("codeDestinataire") String codeDestinataire, @Param("codeOrganisme") String codeOrganisme);

    @Query(value = "select count(e.codres) > 0 from ExemplaireEntity e where e.codres = :codeRessource " +
            " AND e.codsit = :codeSite " +
            " AND e.id.codgam = :codeGamme " +
            " AND e.id.codapp = :codeApplication " +
            " AND e.id.codorg = :codeOrganisme " +
            " AND e.id.codenv = :codeEnvironnement "
    )
    boolean ressourceExistsInExemplaires(@Param("codeRessource") String codeRessource, @Param("codeGamme") String codeGamme, @Param("codeApplication") String codeApplication,
                                         @Param("codeSite")String codeSite, @Param("codeOrganisme")String codeOrganisme, @Param("codeEnvironnement")String codeEnvironnement);

    @Query(value = "select count(*) > 0 from ExemplaireEntity e " +
            "where e.id.codenv = :codEnv " +
            "AND e.id.codorg = :codOrg " +
            " AND e.id.codapp = :codApp " +
            " AND e.id.codcom = :codCom " +
            " AND e.id.codfic = :codFic " +
            " AND e.id.codgam = :codGam "
    )
    boolean isProductAttachedToExemplaire(@Param("codEnv") String codEnv, @Param("codOrg") String codOrg, @Param("codApp") String codApp,
                                         @Param("codCom")String codCom, @Param("codFic")String codFic, @Param("codGam")String codGam);

    @Query(value = "select count(*) > 0 from ExemplaireEntity e " +
            "where e.id.codenv = :#{#query.codenv} " +
            "AND e.id.codorg = :#{#query.codorg} " +
            " AND e.id.codapp = :#{#query.codapp} " +
            " AND e.id.codcom = :#{#query.codcom} " +
            " AND e.id.codfic = :#{#query.codfic} " +
            " AND e.id.codgam = :#{#query.codgam} " +
            " AND e.codsit = :#{#query.codsit} " +
            " AND e.codres = :#{#query.codres} "
    )
    boolean ressourceExists(@Param("query") ExemplaireExistsQuery query);


    @Query(value = "select NEW fr.acoss.posdoc.domain.exemplaire.model.Exemplaire(e.id.codenv, e.id.codorg, e.id.codapp, " +
            " e.id.codcom, e.id.codfic, e.id.codgam, e.id.numexe, e.codsit, e.codres, e.coddes, e.nbrexe, e.exeact)  " +
            " from ExemplaireEntity e " +
            " where e.id.codenv = :codenv " +
            " AND e.id.codorg = :codorg " +
            " AND e.id.codapp = :codapp " +
            " AND e.id.codcom = :codcom " +
            " AND e.id.codfic = :codfic " +
            " AND e.id.codgam = :codgam "
    )
    List<Exemplaire> findExemplairesByCriteres(@Param("codenv") String codenv, @Param("codorg") String codorg,
                            @Param("codapp") String codapp, @Param("codcom") String codcom,
                            @Param("codfic") String codfic, @Param("codgam") String codgam);

    @Query(value = "SELECT e.id.codorg " +
            " FROM ExemplaireEntity e " +
            " WHERE e.id.codenv = :#{#query.codenv} " +
            " and e.id.codapp = :#{#query.codapp} " +
            " and e.id.codcom = :#{#query.codcom} " +
            " and e.id.codfic = :#{#query.codfic} " +
            " and e.id.codgam = :#{#query.codgam} " +
            " and e.codsit = :#{#query.codsit} " +
            " and e.codres = :#{#query.codres} "
    )
    List<String> findOrganismeCompleteByExemplaire(@Param("query") FindOrganismesByExemplaireQuery query);

    @Query(value = "SELECT count(*)>0 " +
            " FROM ExemplaireEntity e " +
            " WHERE e.id.codenv = :#{#query.codenv} " +
            " and e.id.codorg = :#{#query.codorg} " +
            " and e.id.codapp = :#{#query.codapp} " +
            " and e.id.codcom = :#{#query.codcom} " +
            " and e.id.codfic = :#{#query.codfic} " +
            " and e.id.codgam = :#{#query.codgam} " +
            " and e.codsit = :#{#query.codsit} " +
            " and e.codres = :#{#query.codres} " +
            " and e.id.numexe != :#{#query.numexe} "
    )
    boolean exemplaireExists(@Param("query") ExemplaireExistsQuery query);

    @Query(value = "SELECT count(*) = 0 " +
            " FROM ExemplaireEntity a " +
            " WHERE a.id.codenv = (:#{#query.codenv}) " +
            " AND a.id.codapp = (:#{#query.codapp}) " +
            " AND a.id.codcom = (:#{#query.codcom}) " +
            " AND a.id.codorg = (:#{#query.codorg}) " +
            " AND a.id.codfic = (:#{#query.codfic}) " +
            " AND a.id.codgam = (:#{#query.codgam}) " +
            " AND a.exeact = 1 "
    )
    boolean isAllExemplaireDesactivesInProduit(@Param("query") Produi product);


    @Query("SELECT e.id.numexe FROM ExemplaireEntity e " +
            "WHERE e.id.codenv = :#{#id.codenv} " +
            "   AND e.id.codorg = :#{#id.codorg} " +
            "   AND e.id.codapp = :#{#id.codapp} " +
            "   AND e.id.codcom = :#{#id.codcom} " +
            "   AND e.id.codfic = :#{#id.codfic} " +
            "   AND e.id.codgam = :#{#id.codgam} " +
            "   AND e.codres = :codres " +
            "   AND e.codsit = :codsit ")
    String getNumexeFromExemplaire(@Param("id") ExemplaireComposite id, @Param("codres") String codres, @Param("codsit") String codsit);
}

