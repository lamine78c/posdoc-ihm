package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.entities.RessourceCompositeId;
import fr.acoss.posdoc.database.entities.RessourceEntity;
import fr.acoss.posdoc.domain.exemplaire.model.RessourceExistForOrganismeSiteQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvsOrgsAppProfilsQuery;
import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvAppIsadminPayload;
import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvOrgsAppPayload;
import fr.acoss.posdoc.domain.ressource.model.FindOrganismesByRessourceQuery;
import fr.acoss.posdoc.domain.ressource.model.Ressource;
import fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes;
import fr.acoss.posdoc.domain.ressource.model.SearchRessourceByEnvOrgAppProfilQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;

@Repository
public interface RessourceRepository
    extends GenericRepository<RessourceEntity, RessourceCompositeId> {

    @Query(value = "SELECT r FROM RessourceEntity r WHERE " +
            "    ((:codesOrg) IS NULL OR r.id.codeOrganisme IN (:codesOrg))" +
            "and ((:codesGam) IS NULL OR r.id.codeGamme IN (:codesGam))" +
            "ORDER BY r.id.codeOrganisme ASC, r.id.codeGamme ASC"
    )
    List<RessourceEntity> findByListOrgGam(@Param("codesOrg") List<String> codesOrg, @Param("codesGam") List<String> codesGam);


    @Query(value = "SELECT new fr.acoss.posdoc.domain.ressource.model.Ressource(r.id.codeEnvironnement, r.id.codeOrganisme,r.id.codeApplication, r.id.codeGamme, r.id.codeSite, r.id.codeRessource) " +
            " FROM RessourceEntity r WHERE " +
            " r.id.codeApplication = (:#{#query.codeApp}) " +
            " and ((:#{#query.codesOrg}) IS NULL OR r.id.codeOrganisme IN (:#{#query.codesOrg}) OR r.id.codeOrganisme like '999' ) " +
            " and ((:#{#query.codesEnv}) IS NULL OR r.id.codeEnvironnement IN (:#{#query.codesEnv})) " +
            " and ((:codesSite) IS NULL OR r.id.codeSite IN (:codesSite)) " +
            " and (((:#{#query.isProfilAdmin}) = false and r.profil is null) or (:#{#query.isProfilAdmin}) = true) " +
            " ORDER BY r.id.codeOrganisme ASC, r.id.codeGamme ASC "
    )
    List<Ressource> findByAppandEnv(@Param("query") SearchByEnvsOrgsAppProfilsQuery query, @Param("codesSite") List<String> codesSite);

    @Transactional
    void deleteByIdIn(List<RessourceCompositeId> ids);

    @Query("select r.id.codeOrganisme from RessourceEntity r where " +
            " r.id.codeSite = :#{#query.codsit} " +
            " and r.id.codeRessource = :#{#query.codres} " +
            " and r.id.codeGamme = :#{#query.codgam} " +
            " and r.id.codeApplication = :#{#query.codapp} " +
            " and r.id.codeEnvironnement = :#{#query.codenv} " +
            " and ((:#{#query.isadmin} = false and r.profil is null) or :#{#query.isadmin} = true) ")
    List<String> findOrganismesByRessource(@Param("query") FindOrganismesByRessourceQuery query);

    @Query("select count(r) > 0 from RessourceEntity r where " +
            "r.id.codeOrganisme != :codeOrganisme " +
            "and r.id.codeRessource = :codeRessource " +
            "and r.id.codeGamme = :codeGamme " +
            "and r.id.codeApplication = :codeApplication " +
            "and r.id.codeEnvironnement = :codeEnvironnement ")
    boolean isGenericRessourceHasSpecifiqueOne(
            @Param("codeOrganisme") String codeOrganisme,
            @Param("codeRessource") String codeRessource,
            @Param("codeGamme") String codeGamme,
            @Param("codeApplication") String codeApplication,
            @Param("codeEnvironnement") String codeEnvironnement
    );

    @Query("select count(r) > 0 from RessourceEntity r where " +
            "r.id.codeOrganisme = :codeOrganisme " +
            "and r.id.codeRessource = :codeRessource " +
            "and r.id.codeGamme = :codeGamme " +
            "and r.id.codeApplication = :codeApplication " +
            "and r.id.codeEnvironnement = :codeEnvironnement ")
    boolean isSpecifiqueRessourceHasGenericOne(
            @Param("codeOrganisme") String codeOrganisme,
            @Param("codeRessource") String codeRessource,
            @Param("codeGamme") String codeGamme,
            @Param("codeApplication") String codeApplication,
            @Param("codeEnvironnement") String codeEnvironnement
    );

    @Query("select distinct id.codeGamme from RessourceEntity where id.codeGamme in (:gammeCodes)")
    List<String> gammesExistsInRessources(@Param("gammeCodes") List<String> gammeCodes);

    @Query("select distinct r.id.codeRessource from RessourceEntity r where r.codeServeur in (:serverIds)")
    List<String> serversExistsInRessources(@Param("serverIds") List<String> serverIds);

    @Query("select distinct r.id.codeRessource from RessourceEntity r where r.referenceDistributionProduit in (:parametreDistributionCodes)")
    List<String> parametreDistributionsExistsInRessource(@Param("parametreDistributionCodes") List<String> parametreDistributionCodes);

    @Query("SELECT new fr.acoss.posdoc.domain.ressource.model.Ressource(" +
            "  r.id.codeEnvironnement, r.id.codeOrganisme, r.id.codeApplication, " +
            "  r.id.codeGamme, r.id.codeSite, r.id.codeRessource, " +
            "  r.codeServeur, r.libelle, r.type, r.logicielDistribution, " +
            "  r.referenceDistributionProduit, r.referenceDistributionProduitRecap, " +
            "  r.userId, r.password, r.typeFusion, r.destinataire, " +
            "  r.fileImpression, r.informationUtilisateur, r.fileBloquee, " +
            "  r.miseSousPli, r.profil, " +
            "  (CASE WHEN EXISTS (SELECT 1 FROM ExemplaireEntity e " +
            "                     WHERE e.codres = r.id.codeRessource " +
            "                       AND e.codsit = r.id.codeSite " +
            "                       AND e.id.codgam = r.id.codeGamme " +
            "                       AND e.id.codapp = r.id.codeApplication " +
            "                       AND e.id.codorg = r.id.codeOrganisme " +
            "                       AND e.id.codenv = r.id.codeEnvironnement) " +
            "        THEN true ELSE false END)) " +
            "FROM RessourceEntity r " +
            "ORDER BY r.id.codeRessource, r.id.codeEnvironnement, r.id.codeOrganisme, " +
            "         r.id.codeApplication, r.id.codeGamme, r.id.codeSite ASC")
    List<Ressource> findAllByOrderByIdAsc();

    @Query("select r.id.codeGamme as codgam, r.id.codeSite as codsit, r.id.codeRessource as codres" +
            " from RessourceEntity r " +
            " inner join ParametreEntity p on p.value = r.id.codeOrganisme" +
            " where p.code = '"+ ParamsUtils.OGUORG +"' " +
            " and r.id.codeEnvironnement = :#{#query.codenv} " +
            " and r.id.codeApplication = :#{#query.codapp} " +
            " and ((:#{#query.isadmin} = false and r.profil is null) or :#{#query.isadmin} = true) "
    )
    List<Map<String, String>> findGeneralRessourceByEnvAppIsadmin(@Param("query") CodeEnvAppIsadminPayload query);

    @Query("select r.id.codeGamme as codgam, r.id.codeSite as codsit, r.id.codeRessource as codres" +
            " from RessourceEntity r " +
            " where r.id.codeEnvironnement = :#{#query.codenv} " +
            " and r.id.codeApplication = :#{#query.codapp} " +
            " and r.id.codeOrganisme IN (:#{#query.codorgs}) " +
            " and ((:#{#query.isProfilAdmin} = false and r.profil is null) or :#{#query.isProfilAdmin} = true) " +
            " GROUP BY r.id.codeGamme, r.id.codeSite, r.id.codeRessource " +
            " HAVING COUNT(DISTINCT r.id.codeOrganisme) = :#{#count}"
    )
    List<Map<String, String>> findIntersectRessourceByEnvOrgAppIsadmin(@Param("query") CodeEnvOrgsAppPayload query, @Param("count") Long count);

    @Query("select distinct new fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes(" +
            "  r.id.codeGamme, r.id.codeSite, r.id.codeRessource) " +
            " from RessourceEntity r " +
            " where r.id.codeEnvironnement = :#{#query.codenv} " +
            " and r.id.codeApplication = :#{#query.codapp} " +
            " and (r.id.codeOrganisme = :#{#query.codorg} " +
            " or (r.id.codeOrganisme = :genericOrganisme " +
            " and exists (select o.code from OrganismeEntity o where o.code = :#{#query.codorg} " +
            " and (o.codeSite is null or o.codeSite = '' or o.codeSite = r.id.codeSite)))) " +
            " and ((:#{#query.isProfilAdmin} = false and r.profil is null) or :#{#query.isProfilAdmin} = true) " +
            " order by r.id.codeGamme, r.id.codeSite, r.id.codeRessource")
    List<RessourceGamSitRes> findGamSitResByEnvOrgAppProfil(@Param("query") SearchRessourceByEnvOrgAppProfilQuery query,
                                                            @Param("genericOrganisme") String genericOrganisme);

    // La ressource est utilisable par l'organisme si elle lui appartient, ou si elle est générique
    // et que le site de l'organisme (organi.s00_codsit, quand il est renseigné) correspond au site de la ressource
    @Query(value = "select count(r.id.codeRessource) > 0 from RessourceEntity r " +
            "WHERE r.id.codeEnvironnement = :#{#query.codenv} " +
            "AND r.id.codeApplication = :#{#query.codapp} " +
            "AND r.id.codeSite = :#{#query.codsit} " +
            "AND r.id.codeGamme = :#{#query.codgam} " +
            "AND r.id.codeRessource = :#{#query.codres} " +
            "AND (r.id.codeOrganisme = :#{#query.codorg} " +
            "OR (r.id.codeOrganisme = :#{#query.genericOrganisme} AND EXISTS (" +
            "select o.code from OrganismeEntity o WHERE o.code = :#{#query.codorg} " +
            "AND (o.codeSite IS NULL OR o.codeSite = '' OR o.codeSite = :#{#query.codsit}))))"
    )
    boolean isRessourceExistForOrganismeSite(@Param("query") RessourceExistForOrganismeSiteQuery query);

    @Query(value = "select count(r.id.codeRessource) > 0 from RessourceEntity r " +
            "WHERE r.id.codeEnvironnement = :#{#query.codenv} " +
            "AND r.id.codeApplication = :#{#query.codapp} " +
            "AND r.id.codeSite = :#{#query.codsit} " +
            "AND r.id.codeGamme = :#{#query.codgam} " +
            "AND r.id.codeRessource = :#{#query.codres} " +
            "AND (r.id.codeOrganisme = :#{#query.codorg} OR r.id.codeOrganisme = :#{#query.genericOrganisme}) "
    )
    boolean isRessourceExist(@Param("query") RessourceExistForOrganismeSiteQuery query);
}
