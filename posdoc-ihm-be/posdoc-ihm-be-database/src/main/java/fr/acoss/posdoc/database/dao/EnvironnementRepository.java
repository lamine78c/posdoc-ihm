package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.EnvironnementEntity;
import fr.acoss.posdoc.domain.environnement.model.Environnement;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface EnvironnementRepository extends GenericRepository<EnvironnementEntity, String> {

  void deleteAllByCodeIn(final List<String> ids);

  @Query(value = "SELECT new fr.acoss.posdoc.domain.environnement.model.Environnement(e.code, e.libelle, (COUNT(a) > 0)) FROM EnvironnementEntity e " +
          "LEFT JOIN ApplicationEntity a ON e.code = a.id.codeEnvironnement " +
          "GROUP BY e.code ORDER BY e.code ASC")
  List<Environnement> findAllByOrderByCodeAsc();

  @Query(value = "SELECT new EnvironnementEntity(e.code, e.libelle, (COUNT(a) > 0)) FROM EnvironnementEntity e " +
          "INNER JOIN ApplicationEntity a ON e.code = a.id.codeEnvironnement " +
          "GROUP BY e.code ORDER BY e.code ASC")
  List<EnvironnementEntity> findAllInApplicationByOrderByCodeAsc();

  @Query(value = "SELECT new EnvironnementEntity(e.code, e.libelle, (COUNT(a) > 0)) FROM EnvironnementEntity e " +
          "LEFT JOIN ApplicationEntity a ON e.code = a.id.codeEnvironnement " +
          "INNER JOIN FichierEntity f ON e.code = f.id.codeEnv " +
          "GROUP BY e.code ORDER BY e.code ASC")
  List<EnvironnementEntity> findAllInFichierByOrderByCodeAsc();

  @Transactional
  void deleteByCodeIn(Iterable<String> codes);

  @Query("SELECT e.code FROM EnvironnementEntity e ORDER BY e.code ASC")
  List<String> findCodeEnv();
}
