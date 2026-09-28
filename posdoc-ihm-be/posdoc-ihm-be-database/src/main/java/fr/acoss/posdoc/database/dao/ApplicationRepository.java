package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ApplicationCompositeId;
import fr.acoss.posdoc.database.entities.ApplicationEntity;
import fr.acoss.posdoc.domain.application.model.Application;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ApplicationRepository extends GenericRepository<ApplicationEntity, ApplicationCompositeId> {

  @Query(value = "SELECT new fr.acoss.posdoc.domain.application.model.Application(a.id.code, a.libelle, a.id.codeOrganisation, a.id.codeEnvironnement, a.codeSystem, a.codeGroupe, a.lotNumber, " +
          "a.typeRefection, (CASE WHEN EXISTS (SELECT 1 FROM CommandeEntity c WHERE c.id.codapp = a.id.code and c.id.codenv = a.id.codeEnvironnement and c.id.codorg = a.id.codeOrganisation) " +
          "THEN true ELSE false END)) " +
          "FROM ApplicationEntity a " +
          "ORDER BY a.id.code"
  )
  List<Application> findApplications();

  @Query(value = "SELECT a FROM ApplicationEntity a WHERE " +
          " ((:codesEnvironnement) IS NULL OR a.id.codeEnvironnement IN (:codesEnvironnement))" +
          " ORDER BY a.id.code DESC "
  )
  List<ApplicationEntity> findApplicationsByEnv(@Param("codesEnvironnement") List<String> codesEnvironnement);

  @Transactional
  void deleteByIdIn(Iterable<ApplicationCompositeId> ids);

  @Query("select distinct a.id.code from ApplicationEntity a where a.id.codeEnvironnement in (:environnementCodes)")
  List<String> environnementsExistsInApplications(@Param("environnementCodes") List<String> environnementCodes);

  @Query("select distinct a.id.code from ApplicationEntity a where a.id.codeOrganisation in (:organismeCodes)")
  List<String> organismesExistsInApplications(@Param("organismeCodes") List<String> organismeCodes);

  @Query("SELECT DISTINCT a.id.code from ApplicationEntity a ORDER BY a.id.code")
  List<String> findCodeApp();

  @Query("SELECT DISTINCT a.id.code from ApplicationEntity a " +
          "WHERE a.id.codeEnvironnement = :codenv AND a.id.codeOrganisation IN :codorgs " +
          "ORDER BY a.id.code")
  List<String> findCodeAppByEnvOrgs(@Param("codenv") String codenv, @Param("codorgs") List<String> codorgs);
}
