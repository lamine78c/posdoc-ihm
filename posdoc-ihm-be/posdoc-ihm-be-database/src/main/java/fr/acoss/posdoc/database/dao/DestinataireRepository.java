package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.DestinataireCompositeId;
import fr.acoss.posdoc.database.entities.DestinataireEntity;
import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;


@Repository
public interface DestinataireRepository extends GenericRepository<DestinataireEntity, DestinataireCompositeId> {

    @Transactional
    void deleteByIdIn(Iterable<DestinataireCompositeId> ids);

    @Query("SELECT DISTINCT d.id.code FROM DestinataireEntity d WHERE d.id.codeOrg IN (:orgs) ORDER BY d.id.code")
    List<String> getDestinatairesByOrgs(@Param("orgs") List<String> orgs);

    @Query("SELECT new fr.acoss.posdoc.domain.destinataire.model.Destinataire(d.id.code, d.id.codeOrg, d.libelle, d.refPri, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM ExemplaireEntity e WHERE e.coddes = d.id.code AND e.id.codorg = d.id.codeOrg) " +
            "       THEN true ELSE false END)) " +
            "FROM DestinataireEntity d"
    )
    List<Destinataire> findAllDestins();

    @Query("SELECT d.id.code as code, CONCAT(d.id.code,'-',d.libelle) as text " +
            "FROM DestinataireEntity d " +
            "LEFT JOIN ExemplaireEntity e ON d.id.code = e.coddes and d.id.codeOrg = e.id.codorg " +
            "WHERE d.id.codeOrg = :codeOrg " +
            "GROUP BY d.id ORDER BY d.id.code "
    )
    List<Map<String, String>> getDestinatairesToAddNewExemplaire(@Param("codeOrg") String codeOrg);

    @Query("select distinct d.id.code from DestinataireEntity d where d.id.codeOrg in (:organismeCodes)")
    List<String> organismesExistsInDestinations(@Param("organismeCodes") List<String> organismeCodes);

    @Query("SELECT DISTINCT d.id.code as code, d.id.codeOrg as codeOrg FROM DestinataireEntity d ORDER BY d.id.code ")
    List<Map<String, String>> findAllCodeDestinsAndCodeOrg();

    @Query("select d.id.code " +
            " from DestinataireEntity d " +
            " where d.id.codeOrg IN (:#{#codorgs}) " +
            " GROUP BY d.id.code " +
            " HAVING COUNT(DISTINCT d.id.codeOrg) = :#{#count} "
    )
    List<String> findIntersectDestinByOrg(@Param("codorgs") List<String> codorgs, @Param("count") Long count);
}
