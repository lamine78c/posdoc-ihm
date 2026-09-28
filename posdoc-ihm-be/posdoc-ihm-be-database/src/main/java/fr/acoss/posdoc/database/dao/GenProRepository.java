package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.entities.GenProCompositeId;
import fr.acoss.posdoc.database.entities.GenProEntity;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierInput;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static fr.acoss.posdoc.types.Constantes.PROSTA_T;

@Repository
public interface GenProRepository extends GenericRepository<GenProEntity, GenProCompositeId> {
    @QueryLog(entity ="GenProEntity", action = MyslogAction.UPDATE)
    @Modifying
    @Transactional
    @Query("UPDATE GenProEntity genpro SET " +
            " genpro.proSta = '"+PROSTA_T+"', " +
            " genpro.dprodt = now() " +
            " WHERE " +
            " genpro.id.codeEnv = :codenv AND " +
            " genpro.id.codeOrg = :codorg AND " +
            " genpro.id.codeApp = :codapp AND " +
            " genpro.id.perCod = :percod")
    void termineGenPro(
            @Param("codenv") String codenv,
            @Param("codorg") String codorg,
            @Param("codapp") String codapp,
            @Param("percod") String percod
    );

    @Query("SELECT gp.id.codeGam as codgam, g.libelle as libgam, gp.proSta as prosta, gp.proInf as proinf, " +
            "gp.dprodd as dprodd, gp.dprodt as dprodt, gp.dprods as dprods, gp.pagFic as pagfic, gp.pliFic as plific, gp.rejFic as rejfic " +
            "FROM GenProEntity gp " +
            "LEFT JOIN GammeEntity g ON gp.id.codeGam = g.code " +
            "WHERE gp.id.codeEnv = :#{#query.codenv} " +
            "AND gp.id.codeOrg = :#{#query.codorg} " +
            "AND gp.id.codeApp = :#{#query.codapp} " +
            "AND gp.id.perCod = :#{#query.percod} " +
            "AND gp.id.codeCom = :#{#query.codcom} " +
            "AND gp.id.codeFic = :#{#query.codfic} " +
            "AND gp.id.numCom = :#{#query.numcom} " +
            "ORDER BY gp.id.codeGam")
    List<Map<String, Object>> searchProduitsByFichier(@Param("query") SearchProduitsByFichierInput query);
}
