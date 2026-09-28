package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.CommandeCompositeId;
import fr.acoss.posdoc.database.entities.CommandeEntity;
import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeFiltersPayload;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;

@Repository
public interface CommandeRepository extends GenericRepository<CommandeEntity, CommandeCompositeId> {

    @Query(value = "SELECT new CommandeEntity(c.id, c.libelle, o.codeRegion, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM FichierEntity f WHERE f.id.codeCom = c.id.code AND f.id.codeEnv = c.id.codenv AND f.id.codeApp = c.id.codapp AND f.id.codeOrg = c.id.codorg) THEN true ELSE false END)) " +
            " FROM CommandeEntity c " +
            " LEFT JOIN OrganismeEntity o ON o.code = c.id.codorg " +
            " WHERE (:codenv IS NULL OR c.id.codenv LIKE :codenv) " +
            " and ((:codesOrg) IS NULL OR c.id.codorg IN (:codesOrg)) " +
            " and ((:codesApp) IS NULL OR c.id.codapp IN (:codesApp)) " +
            " ORDER BY c.id.code DESC"
    )
    List<CommandeEntity> findCommandesByApp(@Param("codenv") String codenv, @Param("codesOrg") List<String> codesOrg,@Param("codesApp") List<String> codesApp);

    @Query(value = "SELECT c.c05_codapp AS application, c.c05_codorg AS organisme, COALESCE(o.s00_codreg, '') AS codereg, c.c05_codcom AS sorthelper, " +
            "STRING_AGG(c.c05_codenv, ',') AS environnements FROM comman c " +
            "LEFT JOIN organi o ON o.c00_codorg = c.c05_codorg " +
            "WHERE ((:codesEnv) IS NULL OR c.c05_codenv IN (:codesEnv)) " +
            "and ((:codesOrg) IS NULL OR c.c05_codorg IN (:codesOrg)) " +
            "and ((:codesApp) IS NULL OR c.c05_codapp IN (:codesApp)) " +
            "GROUP BY c.c05_codapp, c.c05_codorg, o.s00_codreg, c.c05_codcom",
            nativeQuery = true
    )
    List<Map<String, String>> compareCommandes(@Param("codesEnv") List<String> codesEnv, @Param("codesOrg") List<String> codesOrg, @Param("codesApp") List<String> codesApp);

    @Query("select case when (count(c) > 0) then true else false end from CommandeEntity c where c.id.code = :code")
    boolean existsByCode(@Param("code") String code);

    List<CommandeEntity> findAllById(Iterable<CommandeCompositeId> iterable);

    @Query("select distinct c.id.codapp from CommandeEntity c order by c.id.codapp")
    List<String>  getDistinctApplication();

    @Query("select distinct c.id.codenv from CommandeEntity c where c.id.codapp = :codesApp order by c.id.codenv")
    List<String> findDistinctEnvsByApp(@Param("codesApp") String codesApp);

    @Query("select distinct c.id.code from CommandeEntity c where c.id.codapp = :codesApp and c.id.codenv in :codenvs order by c.id.code")
    List<String> findDistinctCommByAppEnv(@Param("codesApp") String codesApp, @Param("codenvs") List<String> codenvs);

    @Transactional
    void deleteByIdIn(Iterable<CommandeCompositeId> ids);

    @Query("select distinct count(c.id.code) > 0 from CommandeEntity c where c.id.codapp = :applicationCode and c.id.codorg = :codeOrg and c.id.codenv = :codeEnv")
    boolean applicationExistInCommande(@Param("applicationCode") String applicationCode, @Param("codeOrg") String codeOrg, @Param("codeEnv") String codeEnv);

    @Query(value = "SELECT new CommandeEntity(c.id, c.libelle) FROM CommandeEntity c " +
            "WHERE (c.id.codenv IN :codeEnv) " +
            "and (c.id.code like (:codeCom)) " +
            "and (c.id.codapp IN (:codeApp)) "
    )
    List<CommandeEntity> findCommandByProp(@Param("codeEnv") List<String> codeEnv, @Param("codeApp") String codeApp, @Param("codeCom") String codeCom);

    @Query("select distinct c.id.codenv from CommandeEntity c order by c.id.codenv")
    List<String> getDistinctEnvironnement();

    @Query("select distinct c.id.codorg from CommandeEntity c where c.id.codenv in :codenvs order by c.id.codorg")
    List<String> findDistOrgByEnv(@Param("codenvs") List<String> codenvs);

    @Query("select distinct c.id.codapp from CommandeEntity c " +
            "where c.id.codenv in :codenvs and  c.id.codorg in :codorgs " +
            "order by c.id.codapp")
    List<String> findDistAppByEnvOrg(@Param("codenvs") List<String> codenvs, @Param("codorgs") List<String> codorgs);

    @Query(value = "SELECT distinct c.id.codorg from CommandeEntity c " +
            "WHERE c.id.codenv in (:codenvs) AND c.id.codapp in (:codapps) " +
            "order by c.id.codorg")
    List<String> findDistOrgByEnvsAndAppsFromCommande(@Param("codenvs") List<String> codenvs, @Param("codapps") List<String> codapps);

    @Query("select distinct c.id.codapp from CommandeEntity c " +
            "where c.id.codenv in :codenvs order by c.id.codapp")
    List<String> findDistAppByEnvsFromCommande(@Param("codenvs") List<String> codenvs);

    @Query(value = "SELECT new fr.acoss.posdoc.domain.commande.model.Commande" +
            "(c.id.codenv, c.id.codorg, c.id.codapp, c.id.code, c.libelle, COALESCE(o.codeRegion, ''), " +
            " (CASE WHEN EXISTS (SELECT 1 FROM FichierEntity f WHERE f.id.codeCom = c.id.code AND f.id.codeEnv = c.id.codenv AND f.id.codeApp = c.id.codapp AND f.id.codeOrg = c.id.codorg) THEN true ELSE false END)) " +
            " FROM CommandeEntity c " +
            " JOIN OrganismeEntity o ON o.code = c.id.codorg " +
            " WHERE ((:codenvs) IS NULL OR c.id.codenv IN (:codenvs)) " +
            " AND ((:codorgs) IS NULL OR c.id.codorg IN (:codorgs)) " +
            " AND ((:codapp) IS NULL OR c.id.codapp = :codapp) " +
            " ORDER BY c.id.code DESC")
    List<Commande> getCommandesByEnvsOrgsApps(@Param("codenvs") List<String> codenvs, @Param("codorgs") List<String> codorgs, @Param("codapp") String codapp);

    @Query(value = "SELECT new fr.acoss.posdoc.domain.commande.model.Commande" +
            "(c.id.codenv, c.id.codorg, c.id.codapp, c.id.code, c.libelle, COALESCE(o.codeRegion, ''), " +
            " (CASE WHEN EXISTS (SELECT 1 FROM FichierEntity f WHERE f.id.codeCom = c.id.code AND f.id.codeEnv = c.id.codenv AND f.id.codeApp = c.id.codapp AND f.id.codeOrg = c.id.codorg) THEN true ELSE false END)) " +
            " FROM CommandeEntity c " +
            " JOIN OrganismeEntity o ON o.code = c.id.codorg " +
            " WHERE c.id.codenv in :codenvs and  c.id.codorg in :codorgs and c.id.codapp = :codapp " +
            " ORDER BY c.id.code DESC")
    List<Commande> findPreselectedCommande(@Param("codenvs") List<String> codenvs, @Param("codorgs") List<String> codorgs, @Param("codapp") String codapp);

    @Query("SELECT c.id.code, c.libelle " +
            "FROM CommandeEntity c " +
            "WHERE c.id.codenv = :#{#filters.codenv} " +
            "AND c.id.codorg = :#{#filters.codorg} " +
            "AND c.id.codapp = :#{#filters.codapp} " +
            "ORDER BY c.id.code")
    List<Object[]> getCodLibCommandeByEnvOrgApp(@Param("filters") CommandeFiltersPayload filters);
}
