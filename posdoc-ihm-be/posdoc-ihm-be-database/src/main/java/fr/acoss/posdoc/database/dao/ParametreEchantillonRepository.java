package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ParametreEchantillonEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ParametreEchantillonRepository extends GenericRepository<ParametreEchantillonEntity, String> {

    @Transactional
    void deleteAllByReferenceIn(final List<String> ids);

    @Query(value = "SELECT new ParametreEchantillonEntity(p.reference, p.type, p.nombreLots, p.nombrePages, p.random, p.formule, " +
            " (COUNT(fich.refech) > 0)) FROM ParametreEchantillonEntity p " +
            " LEFT JOIN FichierEntity fich ON fich.refech is not null and fich.refech != '' and fich.refech = p.reference " +
            " GROUP BY p.reference " +
            " ORDER BY p.reference ASC "
    )
    List<ParametreEchantillonEntity> selectAll();
}
