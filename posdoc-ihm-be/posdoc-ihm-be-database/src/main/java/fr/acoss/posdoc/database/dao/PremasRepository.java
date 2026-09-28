package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.entities.PremasCompositeId;
import fr.acoss.posdoc.database.entities.PremasEntity;
import fr.acoss.posdoc.domain.premas.model.FindPremasQuery;
import fr.acoss.posdoc.domain.premas.model.InvalidateMassificationInput;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import static fr.acoss.posdoc.types.Statut.CREE;
import static fr.acoss.posdoc.types.Statut.INVALIDE;


@Repository
public interface PremasRepository extends GenericRepository<PremasEntity, PremasCompositeId> {

    @Query("SELECT premas " +
            "FROM PremasEntity premas " +
            "WHERE (:#{#query.codenv} IS NULL OR premas.id.codenv = :#{#query.codenv}) " +
            "AND ((:#{#query.codorgs}) IS NULL OR premas.id.codorg IN (:#{#query.codorgs})) " +
            "AND (:#{#query.codapp} IS NULL OR premas.id.codapp = :#{#query.codapp}) " +
            "AND (:#{#query.codcom} IS NULL OR premas.id.codcom LIKE CONCAT('"+ StringUtils.PERCENT+"', CAST(:#{#query.codcom} AS string), '"+ StringUtils.PERCENT+"') ) " +
            "AND (:#{#query.codfic} IS NULL OR premas.id.codfic LIKE CONCAT('"+ StringUtils.PERCENT+"', CAST(:#{#query.codfic} AS string), '"+ StringUtils.PERCENT+"') ) " +
            "AND (:#{#query.percod} IS NULL OR premas.id.percod LIKE CONCAT('"+ StringUtils.PERCENT+"', CAST(:#{#query.percod} AS string), '"+ StringUtils.PERCENT+"') ) " +
            "AND (:#{#query.codsit} IS NULL OR premas.codsit = :#{#query.codsit}) " +
            "AND (:#{#query.presta} IS NULL OR premas.presta = :#{#query.presta}) " +
            "ORDER BY premas.mascom, premas.masfic, premas.codsit, premas.id.codenv, premas.id.codorg, " +
            "premas.id.codapp, premas.id.percod, premas.id.codcom, premas.id.numcom, premas.id.codfic ")
    List<PremasEntity> getPremas(@Param("query") FindPremasQuery query);

    @Query("SELECT DISTINCT premas.id.codenv as codenv, premas.id.codorg as codorg, premas.id.codapp as codapp " +
            "FROM PremasEntity premas " +
            "ORDER BY premas.id.codenv, premas.id.codorg, premas.id.codapp ")
    List<Map<String, String>> getDistinctEnvOrgAppFromPremas();

    @Modifying
    @Query("UPDATE PremasEntity premas " +
            "SET premas.presta = '" + INVALIDE + "', premas.dprevi = now() " +
            "WHERE premas.id.codenv = :#{#input.codenv} " +
            "AND premas.id.codorg = :#{#input.codorg} " +
            "AND premas.id.codapp = :#{#input.codapp} " +
            "AND premas.id.percod = :#{#input.percod} " +
            "AND premas.id.codcom = :#{#input.codcom} " +
            "AND premas.id.codfic = :#{#input.codfic} " +
            "AND premas.id.numcom = :#{#input.numcom} " +
            "AND premas.presta = '" + CREE + "' ")
    void invalidateMassification(@Param("input") InvalidateMassificationInput input);
}
