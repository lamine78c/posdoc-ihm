package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ImprimeEntity;
import fr.acoss.posdoc.domain.imprime.model.Imprime;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import javax.transaction.Transactional;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ImprimeRepository
    extends GenericRepository<ImprimeEntity, String>, JpaSpecificationExecutor<ImprimeEntity> {

    @Query(value = "SELECT i FROM ImprimeEntity i " +
            "LEFT JOIN FichierEntity f ON f.refImprime = i.reference " +
            "WHERE ((:codesEnv) IS NULL OR f.id.codeEnv IN (:codesEnv))" +
            "AND ((:codesApp) IS NULL OR f.id.codeApp IN (:codesApp)) " +
            "ORDER BY i.reference ASC"
    )
    List<ImprimeEntity> findImprimesByEnvsAndApps(@Param("codesEnv") List<String> codesEnv, @Param("codesApp") List<String> codesApp);

    @Query("select distinct typeComposition from ImprimeEntity where typeComposition in :ids")
    List<String> compositionsExistsInImprime(@Param("ids") List<String> compositionCodes);

    @Transactional
    void deleteByReferenceIn(List<String> references);

    @Query(value = "SELECT new fr.acoss.posdoc.domain.imprime.model.Imprime(i.reference, i.libelle, i.codeRND, i.typeComposition, i.typeCouleur, i.rectoVerso, (COUNT(fich) > 0)) FROM ImprimeEntity i " +
            "LEFT JOIN FichierEntity fich ON fich.refImprime = i.reference " +
            "GROUP BY i.reference, i.typeComposition, i.typeCouleur ORDER BY i.reference ASC"
    )
    List<Imprime> selectAll();
}
