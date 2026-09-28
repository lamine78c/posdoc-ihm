package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.database.entities.TmpMasEntity;
import fr.acoss.posdoc.domain.massification.model.MassificationPool;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.domain.massification.model.OptionFields;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsMassification;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationPayload;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MassificationRepository extends GenericRepository<TmpMasEntity, GenFicEntity>{
  
  String PRESTA_C = "C";

  @Query(value = "SELECT DISTINCT new fr.acoss.posdoc.domain.massification.model.OptionFields( tmpmas.id.codenv, tmpmas.id.codorg, " +
          "tmpmas.id.codapp, tmpmas.id.codcom, tmpmas.id.codfic, " +
          "genfic.codcli, tmpmas.id.percod, genfic.masuti, tmpmas.codsit )" +
          "FROM TmpMasEntity tmpmas " +
          "INNER JOIN GenFicEntity genfic ON tmpmas.id.codfic = genfic.id.codfic AND tmpmas.id.numcom = genfic.id.numcom AND tmpmas.id.codcom = genfic.id.codcom AND tmpmas.id.percod = genfic.id.percod AND tmpmas.id.codapp = genfic.id.codapp AND tmpmas.id.codorg = genfic.id.codorg AND tmpmas.id.codenv = genfic.id.codenv " +
          "INNER JOIN GenProEntity genpro ON tmpmas.id.codfic = genpro.id.codeFic AND tmpmas.id.numcom = genpro.id.numCom AND tmpmas.id.codcom = genpro.id.codeCom AND tmpmas.id.percod = genpro.id.perCod AND tmpmas.id.codapp = genpro.id.codeApp AND tmpmas.id.codorg = genpro.id.codeOrg AND tmpmas.id.codenv = genpro.id.codeEnv " +
          "INNER JOIN OrganismeEntity org ON tmpmas.id.codorg = org.code " +
          "ORDER BY tmpmas.id.codenv, tmpmas.id.codorg, tmpmas.id.codapp, tmpmas.id.codcom, tmpmas.id.codfic, tmpmas.codsit, genfic.codcli, tmpmas.id.percod")
  List<OptionFields> getDistinctFieldsFromTmpMasGenFicGenProOrg();

  @Query(value = "SELECT new fr.acoss.posdoc.domain.massification.model.MassificationPool " +
          "(premas.mascom, premas.masfic, premas.id.codenv, premas.id.codorg," +
          "premas.id.codapp, premas.id.percod, premas.id.codcom, premas.id.codfic, premas.id.numcom) " +
          "FROM TmpMasEntity tmpmas RIGHT JOIN PremasEntity premas ON premas.id.codfic = tmpmas.id.codfic " +
          "AND premas.id.numcom = tmpmas.id.numcom AND premas.id.codcom = tmpmas.id.codcom AND " +
          "premas.id.percod = tmpmas.id.percod AND premas.id.codapp = tmpmas.id.codapp AND " +
          "premas.id.codorg = tmpmas.id.codorg AND premas.id.codenv = tmpmas.id.codenv " +
          "WHERE premas.presta = '"+PRESTA_C+"' AND tmpmas.id.codenv IS NULL " +
          "AND premas.masfic in (:masfics) " +
          "ORDER BY premas.mascom, premas.masfic, premas.id.codenv, premas.id.codorg, " +
          "premas.id.codapp, premas.id.percod, premas.id.codcom, premas.id.codfic, premas.id.numcom")
  List<MassificationPool> getPoolElementsForMassification(
          @Param("masfics") List<String> masfics
  );

  @Query(value = "SELECT new fr.acoss.posdoc.domain.massification.model.MassificationSearch" +
            "(tmpmas.mascom, tmpmas.masfic, tmpmas.codsit, tmpmas.id.codenv, tmpmas.id.codorg, " +
            "tmpmas.id.codapp, tmpmas.id.percod, tmpmas.id.codcom, tmpmas.id.codfic, tmpmas.id.numcom, " +
            "genpro.id.codeGam, genpro.pagFic, genpro.pliFic, genfic.codcli, genfic.codbon, genfic.masuti, tmpmas.libfic, tmpmas.typsup )" +
            "FROM TmpMasEntity tmpmas " +
            "INNER JOIN GenFicEntity genfic ON tmpmas.id.codfic = genfic.id.codfic AND tmpmas.id.numcom = genfic.id.numcom AND tmpmas.id.codcom = genfic.id.codcom AND tmpmas.id.percod = genfic.id.percod AND tmpmas.id.codapp = genfic.id.codapp AND tmpmas.id.codorg = genfic.id.codorg AND tmpmas.id.codenv = genfic.id.codenv " +
            "INNER JOIN GenProEntity genpro ON tmpmas.id.codfic = genpro.id.codeFic AND tmpmas.id.numcom = genpro.id.numCom AND tmpmas.id.codcom = genpro.id.codeCom AND tmpmas.id.percod = genpro.id.perCod AND tmpmas.id.codapp = genpro.id.codeApp AND tmpmas.id.codorg = genpro.id.codeOrg AND tmpmas.id.codenv = genpro.id.codeEnv " +
            "INNER JOIN OrganismeEntity org ON tmpmas.id.codorg = org.code " +
            "WHERE tmpmas.id.codenv = :#{#query.codenv} " +
            "AND (genpro.id.codeGam = :codegam) "+
            "AND ((:#{#query.codorgs}) IS NULL OR tmpmas.id.codorg IN (:#{#query.codorgs})) "+
            "AND (:#{#query.codapp} IS NULL OR tmpmas.id.codapp = :#{#query.codapp}) "+
            "AND (:#{#query.codcom} IS NULL OR tmpmas.id.codcom LIKE :#{#query.codcom}) "+
            "AND (:#{#query.codfic} IS NULL OR tmpmas.id.codfic LIKE :#{#query.codfic}) "+
            "AND (:#{#query.codcli} IS NULL OR genfic.codcli = :#{#query.codcli}) "+
            "AND (:#{#query.percod} IS NULL OR tmpmas.id.percod LIKE :#{#query.percod}) "+
            "AND (:#{#query.masuti} IS NULL OR genfic.masuti = :#{#query.masuti}) "+
            "AND (:#{#query.codsit} IS NULL OR tmpmas.codsit = :#{#query.codsit}) "+
            "ORDER BY tmpmas.mascom, tmpmas.masfic, tmpmas.codsit, tmpmas.id.codenv, tmpmas.id.codorg, tmpmas.id.codapp, tmpmas.id.percod, tmpmas.id.codcom, tmpmas.id.codfic")
    List<MassificationSearch> searchForMassification(
            @Param("query") SearchMassificationQuery query,
            @Param("codegam") String codegam
    );

  @QueryLog(entity = "TmpMasEntity", action = MyslogAction.UPDATE)
  @Modifying
  @Transactional
  @Query("UPDATE TmpMasEntity tmpmas SET tmpmas.codsit = :codsit " +
          "WHERE tmpmas.id.codenv = :#{#query.codenv} AND tmpmas.id.codorg = :#{#query.codorg} AND tmpmas.id.codapp = :#{#query.codapp} " +
          "AND tmpmas.id.percod = :#{#query.percod} AND tmpmas.id.codcom = :#{#query.codcom} AND tmpmas.id.codfic = :#{#query.codfic} " +
          "AND tmpmas.id.numcom = :#{#query.numcom}")
  void updateMassification(@Param("codsit") String codsit, @Param("query") MassificationUpdate query);

  @QueryLog(entity = "GenFicEntity", action = MyslogAction.UPDATE)
  @Modifying
  @Transactional
  @Query("UPDATE GenFicEntity genfic SET genfic.codsit = :codsit " +
          "WHERE genfic.id.codenv = :#{#query.codenv} AND genfic.id.codorg = :#{#query.codorg} AND genfic.id.codapp = :#{#query.codapp} " +
          "AND genfic.id.percod = :#{#query.percod} AND genfic.id.codcom = :#{#query.codcom} AND genfic.id.codfic = :#{#query.codfic} " +
          "AND genfic.id.numcom = :#{#query.numcom}")
  void updateGenfic(@Param("codsit") String codsit, @Param("query") MassificationUpdate query);

  @QueryLog(entity = "PremasEntity", action = MyslogAction.UPDATE)
  @Modifying
  @Transactional
  @Query("UPDATE PremasEntity premas SET premas.codsit = :codsit " +
          "WHERE premas.id.codenv = :#{#query.codenv} AND premas.id.codorg = :#{#query.codorg} AND premas.id.codapp = :#{#query.codapp} " +
          "AND premas.id.percod = :#{#query.percod} AND premas.id.codcom = :#{#query.codcom} AND premas.id.codfic = :#{#query.codfic} " +
          "AND premas.id.numcom = :#{#query.numcom}")
  void updatePremas(@Param("codsit") String codsit, @Param("query") MassificationUpdate query);


  @Query("SELECT DISTINCT new fr.acoss.posdoc.domain.massification.model.MassificationSearch" +
          "(tmpmas.mascom, tmpmas.masfic, tmpmas.codsit, tmpmas.id.codenv, tmpmas.id.codorg, " +
          "tmpmas.id.codapp, tmpmas.id.percod, tmpmas.id.codcom, tmpmas.id.codfic, tmpmas.id.numcom, " +
          "genpro.id.codeGam, genpro.pagFic, genpro.pliFic, genfic.codcli, genfic.codbon, genfic.masuti, tmpmas.libfic, tmpmas.typsup) " +
          "FROM TmpMasEntity tmpmas " +
          "INNER JOIN GenFicEntity genfic ON tmpmas.id.codfic = genfic.id.codfic AND tmpmas.id.numcom = genfic.id.numcom AND tmpmas.id.codcom = genfic.id.codcom AND tmpmas.id.percod = genfic.id.percod AND tmpmas.id.codapp = genfic.id.codapp AND tmpmas.id.codorg = genfic.id.codorg AND tmpmas.id.codenv = genfic.id.codenv " +
          "INNER JOIN GenProEntity genpro ON tmpmas.id.codfic = genpro.id.codeFic AND tmpmas.id.numcom = genpro.id.numCom AND tmpmas.id.codcom = genpro.id.codeCom AND tmpmas.id.percod = genpro.id.perCod AND tmpmas.id.codapp = genpro.id.codeApp AND tmpmas.id.codorg = genpro.id.codeOrg AND tmpmas.id.codenv = genpro.id.codeEnv " +
          "WHERE tmpmas.id.codenv = :#{#query.codenv} AND tmpmas.id.codorg = :#{#query.codorg} AND tmpmas.id.codapp = :#{#query.codapp} " +
          "AND tmpmas.id.percod = :#{#query.percod} AND tmpmas.id.codcom = :#{#query.codcom} AND tmpmas.id.codfic = :#{#query.codfic} " +
          "AND tmpmas.id.numcom = :#{#query.numcom} AND genpro.id.codeGam = :codegam")
  List<MassificationSearch> findUpdatedMassification(@Param("query") MassificationUpdate query, @Param("codegam") String codegam);

  @QueryLog(entity = "TmpMasEntity", action = MyslogAction.DELETE)
  @Modifying
  @Transactional
  @Query("DELETE FROM TmpMasEntity tmpmas WHERE tmpmas.id.codenv = :codenv AND tmpmas.id.codorg = :codorg AND tmpmas.id.codapp = :codapp " +
          "AND tmpmas.id.percod = :percod AND tmpmas.id.codcom = :codcom AND tmpmas.id.codfic = :codfic AND tmpmas.id.numcom = :numcom")
  void deleteMassification(@Param("codenv") String codenv, @Param("codorg") String codorg, @Param("codapp") String codapp,
                           @Param("percod") String percod, @Param("codcom") String codcom, @Param("codfic") String codfic,
                           @Param("numcom") String numcom);

  @Query(value = "SELECT new fr.acoss.posdoc.domain.occurrence.application.model.DetailsMassification" +
          "(genmas.id.masper, genmas.id.mascom, genmas.id.masfic, genmas.id.masnum, genmas.id.codorg, genmas.id.codapp, genmas.id.percod, genmas.id.codcom, genmas.id.codfic, genmas.id.numcom, " +
          " fichie.libFichier, fichie.refImprime, genfic1.codprd, genfic1.masuti, genpro.pagFic, genpro.pliFic, genfic1.codcli, genmas.id.masenv) " +
          " FROM FichierEntity fichie " +
          " INNER JOIN GenFicEntity genfic ON fichie.id.codeFich = genfic.id.codfic AND fichie.id.codeCom = genfic.id.codcom AND fichie.id.codeEnv = genfic.id.codenv AND fichie.id.codeOrg = genfic.id.codorg AND fichie.id.codeApp = genfic.id.codapp " +
          " INNER JOIN GenMasEntity genmas ON genmas.id.masfic = genfic.id.codfic AND genmas.id.masnum = genfic.id.numcom AND genmas.id.mascom = genfic.id.codcom AND genmas.id.masper = genfic.id.percod AND genmas.id.masapp = genfic.id.codapp AND genmas.id.masorg = genfic.id.codorg AND genmas.id.masenv = genfic.id.codenv " +
          " INNER JOIN GenFicEntity genfic1 ON genmas.id.codfic = genfic1.id.codfic AND genmas.id.numcom = genfic1.id.numcom AND genmas.id.codcom = genfic1.id.codcom AND genmas.id.percod = genfic1.id.percod AND genmas.id.codapp = genfic1.id.codapp AND genmas.id.codorg = genfic1.id.codorg AND genmas.id.codenv = genfic1.id.codenv " +
          " INNER JOIN GenProEntity genpro ON genfic1.id.codfic = genpro.id.codeFic AND genfic1.id.numcom = genpro.id.numCom AND genfic1.id.codcom = genpro.id.codeCom AND genfic1.id.percod = genpro.id.perCod AND genfic1.id.codapp = genpro.id.codeApp AND genfic1.id.codorg = genpro.id.codeOrg AND genfic1.id.codenv = genpro.id.codeEnv " +
          " WHERE genmas.id.masenv = :codenv " +
          " AND genmas.id.masorg = :codorg "+
          " AND genmas.id.masapp = :codapp "+
          " AND genmas.id.masper = :percod "+
          " AND genpro.id.codeGam = :codgam "+
          " ORDER BY genmas.id.mascom, genmas.id.masfic, genmas.id.codenv, genmas.id.codorg, genmas.id.codapp, genmas.id.percod, genmas.id.codcom, genmas.id.codfic "
  )
  List<DetailsMassification> findDetailsMassificationForOccurrenceApplication(@Param("codenv") String codenv, @Param("codorg") String codorg, @Param("codapp") String codapp,
                                                                 @Param("percod") String percod, @Param("codgam") String codgam);
  @Query("SELECT g.id.perCod FROM GenAppEntity g WHERE g.id.codeEnv = :codenv " +
          "AND g.id.codeOrg = :codorg AND g.id.codeApp = :codapp " +
          "AND g.id.perCod LIKE :percod ORDER BY g.id.perCod DESC")
  List<String> findPercodForMassification(
          @Param("codenv") String codenv,
          @Param("codorg") String codorg,
          @Param("codapp") String codapp,
          @Param("percod") String percod
  );

  @Query("SELECT genfic FROM GenFicEntity genfic " +
          "INNER JOIN GenMasEntity genmas ON genmas.id.codfic = genfic.id.codfic AND genmas.id.numcom = genfic.id.numcom " +
          "   AND genmas.id.codcom = genfic.id.codcom AND genmas.id.percod = genfic.id.percod AND genmas.id.codapp = genfic.id.codapp " +
          "   AND genmas.id.codorg = genfic.id.codorg AND genmas.id.codenv = genfic.id.codenv " +
          "WHERE genmas.id.masenv = :#{#query.codenv} " +
          "   AND genmas.id.masorg = :#{#query.codorg} " +
          "   AND genmas.id.masapp = :#{#query.codapp} " +
          "   AND genmas.id.masper = :#{#query.percod} " +
          "   AND genmas.id.mascom = :#{#query.codcom} " +
          "   AND genmas.id.masnum = :#{#query.numcom} " +
          "   AND genmas.id.masfic = :#{#query.codfic} " +
          "ORDER BY genfic.id.codenv, genfic.id.codorg, genfic.id.codapp, genfic.id.percod, genfic.id.codcom, genfic.id.codfic, genfic.id.numcom")
  List<GenFicEntity> findDetailsMassificationForOccurrenceEtape(@Param("query") DetailsMassificationPayload query);
}
