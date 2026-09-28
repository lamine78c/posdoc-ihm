package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenTarCompositeId;
import fr.acoss.posdoc.database.entities.GenTarEntity;
import fr.acoss.posdoc.domain.bontravail.model.UpdateGenTarQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierInput;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Repository
public interface GenTarRepository extends GenericRepository<GenTarEntity, GenTarCompositeId> {

    @QueryLog(entity ="GenTarEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenTarEntity gentar SET " +
            " gentar.id.c45Typtar = :#{#query.typtar}, " +
            " gentar.n45Nbplis = :#{#query.nbplis}, " +
            " gentar.n45Coutot = :#{#query.coutot} " +
            " WHERE " +
            " gentar.id.c45Codenv = :#{#query.codenv} AND " +
            " gentar.id.c45Codorg = :#{#query.codorg} AND " +
            " gentar.id.c45Codapp = :#{#query.codapp} AND " +
            " gentar.id.c45Percod = :#{#query.percod} AND " +
            " gentar.id.c45Codcom = :#{#query.codcom} AND " +
            " gentar.id.c45Numcom = :#{#query.numcom} AND " +
            " gentar.id.c45Codfic = :#{#query.codfic} ")
    void updateGenTarForBonTravailManuel(@Param("query") UpdateGenTarQuery query);

    @Query("SELECT DISTINCT g.id.c45Typtar FROM GenTarEntity g WHERE g.id.c45Typtar IS NOT NULL AND g.id.c45Typtar <> '' ORDER BY g.id.c45Typtar")
    List<String> findTyptarFromGentar();

    @QueryLog(entity ="GenTarEntity", action = MyslogAction.UPDATE)
    @Transactional
    @Modifying
    @Query("UPDATE GenTarEntity gentar SET " +
           " gentar.n45Nbplis = :#{#gentar.nbplis}, " +
           " gentar.n45Coutot = :#{#gentar.coutot} " +
           "WHERE " +
           " gentar.id.c45Codenv = :#{#gentar.codenv} AND " +
           " gentar.id.c45Codorg = :#{#gentar.codorg} AND " +
           " gentar.id.c45Codapp = :#{#gentar.codapp} AND " +
           " gentar.id.c45Percod = :#{#gentar.percod} AND " +
           " gentar.id.c45Codcom = :#{#gentar.codcom} AND " +
           " gentar.id.c45Numcom = :#{#gentar.numcom} AND " +
           " gentar.id.c45Codfic = :#{#gentar.codfic} AND " +
           " gentar.id.c45Typtar = :#{#gentar.typtar}")
    void updateGenTarForConsolidationFacturation(@Param("gentar") GenTar gentar);

    @QueryLog(entity = "GenTarEntity", action = MyslogAction.DELETE)
    @Transactional
    @Modifying
    @Query("DELETE FROM GenTarEntity gentar " +
           "WHERE " +
           " gentar.id.c45Codenv = :#{#gentar.codenv} AND " +
           " gentar.id.c45Codorg = :#{#gentar.codorg} AND " +
           " gentar.id.c45Codapp = :#{#gentar.codapp} AND " +
           " gentar.id.c45Percod = :#{#gentar.percod} AND " +
           " gentar.id.c45Codcom = :#{#gentar.codcom} AND " +
           " gentar.id.c45Numcom = :#{#gentar.numcom} AND " +
           " gentar.id.c45Codfic = :#{#gentar.codfic} AND " +
           " gentar.id.c45Typtar = :#{#gentar.typtar}")
    void deleteGenTarForConsolidationFacturation(@Param("gentar") GenTar gentar);

    // Cette requête est loggée manuellement (voir la méthode FacturationDetailleePersistenceImpl.logRecalculateCoutot())
    // Elle permets de recalculer le coutot seuelement si le tarpos n'est pas libre
    // Lorsqu'il y a plusieurs périodes chevauchées, ell va s'appliquer sur le dernier
    @Modifying
    @Transactional
    @Query(value = "UPDATE GENTAR GT " +
            "SET N45_COUTOT = COALESCE((SELECT GT.N45_NBPLIS * TF.N44_COUPLI " +
            "   FROM GENFIC GF " +
            "   JOIN TARIFS TF ON TF.C44_TYPTAR = GT.C45_TYPTAR " +
            "   WHERE GF.C15_CODENV = GT.C45_CODENV " +
            "     AND GF.C15_CODORG = GT.C45_CODORG " +
            "     AND GF.C15_CODAPP = GT.C45_CODAPP " +
            "     AND GF.C15_PERCOD = GT.C45_PERCOD " +
            "     AND GF.C15_CODCOM = GT.C45_CODCOM " +
            "     AND GF.C15_NUMCOM = GT.C45_NUMCOM " +
            "     AND GF.C15_CODFIC = GT.C45_CODFIC " +
            "     AND ( " +
            "       (GF.D15_DFIEXP IS NULL AND TF.D44_DTARIF IS NULL) " +
            "       OR (TF.D44_DTARID <= GF.D15_DFIEXP AND ( TF.D44_DTARIF IS NULL OR TF.D44_DTARIF >= GF.D15_DFIEXP)) " +
            "     ) " +
            "     ORDER BY TF.D44_DTARID DESC, TF.C44_NUMTAR DESC " +
            "     LIMIT 1 " +
            "), 0) " +
            "WHERE " +
            "   EXISTS ( " +
            "     SELECT 1 " +
            "     FROM TARPOS TP " +
            "     WHERE TP.C43_TYPTAR = GT.C45_TYPTAR AND TP.B43_TLIBRE = 0 " +
            "   ) " +
            "   AND EXISTS ( " +
            "     SELECT 1 " +
            "     FROM GENFIC GF " +
            "     WHERE GF.C15_CODENV = GT.C45_CODENV " +
            "       AND GF.C15_CODORG = GT.C45_CODORG " +
            "       AND GF.C15_CODAPP = GT.C45_CODAPP " +
            "       AND GF.C15_PERCOD = GT.C45_PERCOD " +
            "       AND GF.C15_CODCOM = GT.C45_CODCOM " +
            "       AND GF.C15_NUMCOM = GT.C45_NUMCOM " +
            "       AND GF.C15_CODFIC = GT.C45_CODFIC " +
            "   ) " +
            "   AND GT.C45_CODENV = :#{#consolidation.codenv} " +
            "   AND GT.C45_CODORG = :#{#consolidation.codorg} " +
            "   AND GT.C45_CODAPP = :#{#consolidation.codapp} " +
            "   AND GT.C45_PERCOD = :#{#consolidation.percod} " +
            "   AND GT.C45_CODCOM = :#{#consolidation.codcom} " +
            "   AND GT.C45_NUMCOM = :#{#consolidation.numcom} " +
            "   AND GT.C45_CODFIC = :#{#consolidation.codfic} ", nativeQuery = true)
    void recalculateCoutotForConsolidationFacturation(@Param("consolidation") UpdateConsolidationFacturation consolidation);

    // Cette requête est loggée manuellement (voir la méthode FacturationDetailleePersistenceImpl.logRecalculate())
    // Elle permets de recalculer le coutot seuelement si le tarpos n'est pas libre
    // Lorsqu'il y a plusieurs périodes chevauchées, ell va s'appliquer sur le dernier
    @Modifying
    @Transactional
    @Query(value = "UPDATE GENTAR GT " +
    "SET N45_COUTOT = COALESCE((SELECT GT.N45_NBPLIS * TF.N44_COUPLI " +
    "   FROM GENFIC GF " +
    "   JOIN TARIFS TF ON TF.C44_TYPTAR = GT.C45_TYPTAR " +
    "   WHERE GF.C15_CODENV = GT.C45_CODENV " +
    "     AND GF.C15_CODORG = GT.C45_CODORG " +
    "     AND GF.C15_CODAPP = GT.C45_CODAPP " +
    "     AND GF.C15_PERCOD = GT.C45_PERCOD " +
    "     AND GF.C15_CODCOM = GT.C45_CODCOM " +
    "     AND GF.C15_NUMCOM = GT.C45_NUMCOM " +
    "     AND GF.C15_CODFIC = GT.C45_CODFIC " +
    "     AND (CAST(:#{#query.codsit} AS VARCHAR) IS NULL OR GF.S15_CODSIT = CAST(:#{#query.codsit} AS VARCHAR)) " +
    "     AND ( " +
    "       (GF.D15_DFIEXP IS NULL AND TF.D44_DTARIF IS NULL) " +
    "       OR (TF.D44_DTARID <= GF.D15_DFIEXP AND ( TF.D44_DTARIF IS NULL OR TF.D44_DTARIF >= GF.D15_DFIEXP)) " +
    "     ) " +
    "     ORDER BY TF.D44_DTARID DESC, TF.C44_NUMTAR DESC " +
    "     LIMIT 1 " +
    "), 0) " +
    "WHERE " +
    "   EXISTS ( " +
    "     SELECT 1 " +
    "     FROM TARPOS TP " +
    "     WHERE TP.C43_TYPTAR = GT.C45_TYPTAR AND TP.B43_TLIBRE = 0 " +
    "   ) " +
    "   AND EXISTS ( " +
    "     SELECT 1 " +
    "     FROM GENFIC GF " +
    "     WHERE GF.C15_CODENV = GT.C45_CODENV " +
    "       AND GF.C15_CODORG = GT.C45_CODORG " +
    "       AND GF.C15_CODAPP = GT.C45_CODAPP " +
    "       AND GF.C15_PERCOD = GT.C45_PERCOD " +
    "       AND GF.C15_CODCOM = GT.C45_CODCOM " +
    "       AND GF.C15_NUMCOM = GT.C45_NUMCOM " +
    "       AND GF.C15_CODFIC = GT.C45_CODFIC " +
    "       AND (CAST(:#{#query.codsit} AS VARCHAR) IS NULL OR GF.S15_CODSIT = CAST(:#{#query.codsit} AS VARCHAR)) " +
    "   ) " +
    "   AND GT.C45_CODENV = :#{#query.codenv} " +
    "   AND GT.C45_CODORG IN :#{#query.codorg} " +
    "   AND GT.C45_CODAPP = :#{#query.codapp} " +
    "   AND (CAST(:#{#query.percod} AS VARCHAR) IS NULL OR GT.C45_PERCOD = CAST(:#{#query.percod} AS VARCHAR)) " +
    "   AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL OR GT.C45_CODCOM LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "   AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL OR GT.C45_CODFIC LIKE CAST(:#{#query.codfic} AS VARCHAR)) ", nativeQuery = true)
    void recalculateCout(@Param("query") SearchConsolidationFacturationQuery query);

    // Cette requête est loggée manuellement (voir la méthode FacturationDetailleePersistenceImpl.logRecalculate())
    // Elle permets de recalculer le coutot sur le périmètre MAS, seuelement si le tarpos n'est pas libre
    // Lorsqu'il y a plusieurs périodes chevauchées, ell va s'appliquer sur le dernier
    @Modifying
    @Transactional
    @Query(value = "UPDATE GENTAR GT1 " +
    "SET N45_COUTOT = COALESCE(( " +
    "    SELECT GT.N45_NBPLIS * TF.N44_COUPLI " +
    "    FROM GENMAS GM " +
    "    JOIN GENTAR GT " +
    "      ON GT.C45_CODENV = GM.C31_CODENV " +
    "     AND GT.C45_CODORG = GM.C31_CODORG " +
    "     AND GT.C45_CODAPP = GM.C31_CODAPP " +
    "     AND GT.C45_PERCOD = GM.C31_PERCOD " +
    "     AND GT.C45_CODCOM = GM.C31_CODCOM " +
    "     AND GT.C45_NUMCOM = GM.C31_NUMCOM " +
    "     AND GT.C45_CODFIC = GM.C31_CODFIC " +
    "    JOIN GENFIC GF " +
    "      ON GF.C15_CODENV = GT.C45_CODENV " +
    "     AND GF.C15_CODORG = GT.C45_CODORG " +
    "     AND GF.C15_CODAPP = GT.C45_CODAPP " +
    "     AND GF.C15_PERCOD = GT.C45_PERCOD " +
    "     AND GF.C15_CODCOM = GT.C45_CODCOM " +
    "     AND GF.C15_NUMCOM = GT.C45_NUMCOM " +
    "     AND GF.C15_CODFIC = GT.C45_CODFIC " +
    "    JOIN TARPOS TP " +
    "      ON TP.C43_TYPTAR = GT.C45_TYPTAR " +
    "     AND TP.B43_TLIBRE = 0 " +
    "    JOIN TARIFS TF " +
    "      ON TF.C44_TYPTAR = GT.C45_TYPTAR " +
    "    WHERE GM.C31_MASENV = :#{#query.codenv} " +
    "      AND GM.C31_MASORG IN (:#{#query.codorg}) " +
    "      AND GM.C31_MASAPP = :#{#query.codapp} " +
    "      AND GM.C31_MASPER = :#{#query.percod} " +
    "      AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASCOM LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASFIC LIKE CAST(:#{#query.codfic} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codsit} AS VARCHAR) IS NULL " +
    "           OR GF.S15_CODSIT = CAST(:#{#query.codsit} AS VARCHAR)) " +
    "      AND ( " +
    "           (GF.D15_DFIEXP IS NULL AND TF.D44_DTARIF IS NULL) " +
    "           OR " +
    "           (TF.D44_DTARID <= GF.D15_DFIEXP " +
    "            AND (TF.D44_DTARIF IS NULL " +
    "                 OR TF.D44_DTARIF >= GF.D15_DFIEXP)) " +
    "      ) " +
    "      AND GT.C45_CODENV = GT1.C45_CODENV " +
    "      AND GT.C45_CODORG = GT1.C45_CODORG " +
    "      AND GT.C45_CODAPP = GT1.C45_CODAPP " +
    "      AND GT.C45_PERCOD = GT1.C45_PERCOD " +
    "      AND GT.C45_CODCOM = GT1.C45_CODCOM " +
    "      AND GT.C45_NUMCOM = GT1.C45_NUMCOM " +
    "      AND GT.C45_CODFIC = GT1.C45_CODFIC " +
    "      AND GT.C45_TYPTAR = GT1.C45_TYPTAR " +
    "    ORDER BY TF.D44_DTARID DESC, TF.C44_NUMTAR DESC " +
    "    LIMIT 1 " +
    "), 0) " +
    "WHERE EXISTS ( " +
    "    SELECT 1 " +
    "    FROM GENMAS GM " +
    "    JOIN GENFIC GF " +
    "      ON GF.C15_CODENV = GT1.C45_CODENV " +
    "     AND GF.C15_CODORG = GT1.C45_CODORG " +
    "     AND GF.C15_CODAPP = GT1.C45_CODAPP " +
    "     AND GF.C15_PERCOD = GT1.C45_PERCOD " +
    "     AND GF.C15_CODCOM = GT1.C45_CODCOM " +
    "     AND GF.C15_NUMCOM = GT1.C45_NUMCOM " +
    "     AND GF.C15_CODFIC = GT1.C45_CODFIC " +
    "    JOIN TARPOS TP " +
    "      ON TP.C43_TYPTAR = GT1.C45_TYPTAR " +
    "     AND TP.B43_TLIBRE = 0 " +
    "    WHERE GM.C31_MASENV = :#{#query.codenv} " +
    "      AND GM.C31_MASORG IN (:#{#query.codorg}) " +
    "      AND GM.C31_MASAPP = :#{#query.codapp} " +
    "      AND GM.C31_MASPER = :#{#query.percod} " +
    "      AND GM.C31_CODENV = GT1.C45_CODENV " +
    "      AND GM.C31_CODORG = GT1.C45_CODORG " +
    "      AND GM.C31_CODAPP = GT1.C45_CODAPP " +
    "      AND GM.C31_PERCOD = GT1.C45_PERCOD " +
    "      AND GM.C31_CODCOM = GT1.C45_CODCOM " +
    "      AND GM.C31_NUMCOM = GT1.C45_NUMCOM " +
    "      AND GM.C31_CODFIC = GT1.C45_CODFIC " +
    "      AND (CAST(:#{#query.codcom} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASCOM LIKE CAST(:#{#query.codcom} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codfic} AS VARCHAR) IS NULL " +
    "           OR GM.C31_MASFIC LIKE CAST(:#{#query.codfic} AS VARCHAR)) " +
    "      AND (CAST(:#{#query.codsit} AS VARCHAR) IS NULL " +
    "           OR GF.S15_CODSIT = CAST(:#{#query.codsit} AS VARCHAR)) " +
    ")", nativeQuery = true)
    void recalculateCoutMas(@Param("query") SearchConsolidationFacturationQuery query);

    @Query("SELECT g.id.c45Typtar as typtar, t.libelle as libtar, g.n45Nbplis as nbplis, g.n45Coutot as coutot " +
            " FROM GenTarEntity g " +
            " LEFT JOIN TarposEntity t ON g.id.c45Typtar = t.type " +
            " WHERE g.id.c45Codenv = :#{#query.codenv} " +
            " AND g.id.c45Codorg = :#{#query.codorg} " +
            " AND g.id.c45Codapp = :#{#query.codapp} " +
            " AND g.id.c45Percod = :#{#query.percod} " +
            " AND g.id.c45Codcom = :#{#query.codcom} " +
            " AND g.id.c45Codfic = :#{#query.codfic} " +
            " AND g.id.c45Numcom = :#{#query.numcom} " +
            " ORDER BY t.ordre")
    List<Map<String, Object>> searchFacturationsByFichier(@Param("query") SearchFacturationsByFichierInput query);

    @Query("SELECT g.id.c45Typtar as typtar, t.libelle as libtar, CAST(SUM(g.n45Nbplis) as integer) as nbplis, CAST(SUM(g.n45Coutot) as integer) as coutot " +
            " FROM GenMasEntity gm " +
            " LEFT JOIN GenTarEntity g ON " +
            " gm.id.codenv = g.id.c45Codenv AND gm.id.codorg = g.id.c45Codorg " +
            " AND gm.id.codapp = g.id.c45Codapp AND gm.id.percod = g.id.c45Percod " +
            " AND gm.id.codcom = g.id.c45Codcom AND gm.id.numcom = g.id.c45Numcom " +
            " AND gm.id.codfic = g.id.c45Codfic " +
            " LEFT JOIN TarposEntity t ON g.id.c45Typtar = t.type " +
            " WHERE gm.id.masenv = :#{#query.codenv} " +
            " AND gm.id.masorg = :#{#query.codorg} " +
            " AND gm.id.masapp = :#{#query.codapp} " +
            " AND gm.id.masper = :#{#query.percod} " +
            " AND gm.id.mascom = :#{#query.codcom} " +
            " AND gm.id.masfic = :#{#query.codfic} " +
            " AND gm.id.masnum = :#{#query.numcom} " +
            " GROUP BY g.id.c45Typtar, t.libelle, t.ordre " +
            " ORDER BY t.ordre")
    List<Map<String, Object>> searchFacturationsByFichierMas(@Param("query") SearchFacturationsByFichierInput query);


    @Query("SELECT g.id.c45Codenv as codenv, g.id.c45Codorg as codorg, g.id.c45Codapp as codapp, g.id.c45Percod as percod, " +
            " g.id.c45Codcom as codcom, g.id.c45Numcom as numcom, g.id.c45Codfic as codfic, t.libelle as libtar, g.n45Nbplis as nbplis, g.n45Coutot as coutot " +
            " FROM GenMasEntity gm " +
            " LEFT JOIN GenTarEntity g ON " +
            " gm.id.codenv = g.id.c45Codenv AND gm.id.codorg = g.id.c45Codorg " +
            " AND gm.id.codapp = g.id.c45Codapp AND gm.id.percod = g.id.c45Percod " +
            " AND gm.id.codcom = g.id.c45Codcom AND gm.id.numcom = g.id.c45Numcom " +
            " AND gm.id.codfic = g.id.c45Codfic " +
            " LEFT JOIN TarposEntity t ON g.id.c45Typtar = t.type " +
            " WHERE gm.id.masenv = :#{#query.codenv} " +
            " AND gm.id.masorg = :#{#query.codorg} " +
            " AND gm.id.masapp = :#{#query.codapp} " +
            " AND gm.id.masper = :#{#query.percod} " +
            " AND gm.id.mascom = :#{#query.codcom} " +
            " AND gm.id.masfic = :#{#query.codfic} " +
            " AND gm.id.masnum = :#{#query.numcom} " +
            " ORDER BY g.id.c45Codenv, g.id.c45Codorg, g.id.c45Codapp, g.id.c45Percod, g.id.c45Codcom, g.id.c45Codfic, g.id.c45Numcom, t.ordre")
    List<Map<String, Object>> searchGenTarByFichierMas(@Param("query") SearchFacturationsByFichierInput query);

    @Query(value = "SELECT COALESCE(SUM(g.n45Nbplis), 0) AS plific " +
            "FROM GenTarEntity g " +
            "INNER JOIN TarposEntity t ON g.id.c45Typtar = t.type " +
            "WHERE g.id.c45Codenv = :#{#consolidation.codenv} " +
            "   AND g.id.c45Codorg = :#{#consolidation.codorg} " +
            "   AND g.id.c45Codapp = :#{#consolidation.codapp} " +
            "   AND g.id.c45Percod = :#{#consolidation.percod} " +
            "   AND g.id.c45Codcom = :#{#consolidation.codcom} " +
            "   AND g.id.c45Numcom = :#{#consolidation.numcom} " +
            "   AND g.id.c45Codfic = :#{#consolidation.codfic} " +
            "   AND t.compta = 0 ")
    Integer getNbplisForConsolidationFacturation(@Param("consolidation") UpdateConsolidationFacturation consolidation);
}
