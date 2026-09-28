package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.TarifCompositeId;
import fr.acoss.posdoc.database.entities.TarifEntity;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.tarif.model.TarifAlreadyExistsOnPeriodQuery;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface TarifRepository extends GenericRepository<TarifEntity, TarifCompositeId> {

  Optional<TarifEntity> findFirstByIdTypeOrderByIdNumeroDesc(final String type);

  @Transactional
  void deleteByIdIn(Iterable<TarifCompositeId> ids);

  @Query("SELECT t FROM TarifEntity t WHERE t.id.type = :typtar AND t.dateFin IS NULL")
  TarifEntity getTarifByTyptar(@Param("typtar") String typtar);

  @QueryLog(entity = "GenTarEntity",action = MyslogAction.DELETE)
  @Modifying
  @Transactional
  @Query("DELETE FROM GenTarEntity gt " +
          "WHERE gt.id.c45Codenv = :#{#query.codenv} " +
          "   AND gt.id.c45Codorg = :#{#query.codorg} " +
          "   AND gt.id.c45Codapp = :#{#query.codapp} " +
          "   AND gt.id.c45Percod = :#{#query.percod} " +
          "   AND gt.id.c45Numcom = :#{#query.numcom} " +
          "   AND gt.id.c45Codcom = :#{#query.codcom} " +
          "   AND gt.id.c45Codfic = :#{#query.codfic}")
  void deleteGentar(@Param("query") DeleteBonTravailManuelQuery query);


  @Query("SELECT t FROM TarifEntity t WHERE t.id.type = :typtar ")
  List<TarifEntity> getTarifByType(@Param("typtar") String typtar);

  @QueryLog(entity = "TarifEntity",action = MyslogAction.DELETE)
  @Modifying
  @Query("DELETE  FROM TarifEntity t WHERE t.id.type IN :typtars ")
  void deleteTarifEntitiesByTypes(@Param("typtars") List<String> typtars);

  @Query("SELECT COUNT(t) FROM TarifEntity t " +
          "WHERE t.id.type = :#{#query.typtar} " +
          "   AND (:#{#query.numtar} IS NULL OR t.id.numero != :#{#query.numtar}) " +
          "   AND (CAST(:#{#query.endDate} as string) IS NULL OR CAST(t.dateDebut as string) <= CAST(:#{#query.endDate} as string)) " +
          "   AND (t.dateFin IS NULL OR t.dateFin >= CAST(:#{#query.startDate} as date))")
  Integer searchIfTarifExistsOnPeriod(@Param("query") TarifAlreadyExistsOnPeriodQuery query);

}

