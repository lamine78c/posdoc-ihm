package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.GammeEntity;
import fr.acoss.posdoc.domain.gammes.model.Gamme;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface GammeRepository extends GenericRepository<GammeEntity, String> {

  @Transactional
  void deleteAllByCodeIn(final List<String> codes);

  @Query("select distinct codeVerrou from GammeEntity where codeVerrou in (:codes)")
  List<String> existsVerrous(@Param("codes") List<String> codes);

  @Query(value = "SELECT new fr.acoss.posdoc.domain.gammes.model.Gamme(g.code, g.libelle, g.codeVerrou, COUNT(r) > 0) " +
          " FROM GammeEntity g " +
          " LEFT JOIN RessourceEntity r ON g.code = r.id.codeGamme " +
          " GROUP BY g.code ORDER BY g.code ASC"
  )
  List<Gamme> findAllByOrderByCodeAsc();
}
