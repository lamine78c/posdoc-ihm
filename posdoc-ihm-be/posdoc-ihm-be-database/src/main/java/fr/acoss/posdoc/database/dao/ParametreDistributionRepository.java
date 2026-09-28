package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ParametreDistributionEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ParametreDistributionRepository
    extends GenericRepository<ParametreDistributionEntity, String> {

    @Query(value = "SELECT new ParametreDistributionEntity(p.reference, p.libelle, p.logicielDistribution,  p.commandeDistribution, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM RessourceEntity r WHERE p.reference = r.referenceDistributionProduit) THEN TRUE ELSE FALSE END)) " +
            " FROM ParametreDistributionEntity p " +
            " ORDER BY p.reference ASC "
    )
    List<ParametreDistributionEntity> findAllByOrderByReferenceAsc();

    @Transactional
    void deleteByReferenceIn(Iterable<String> references);

}
