package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.AdresseRetourCompositeId;
import fr.acoss.posdoc.database.entities.AdresseRetourEntity;
import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface AdresseRetourRepository extends GenericRepository<AdresseRetourEntity, AdresseRetourCompositeId> {

    @Transactional
    void deleteByIdIn(Iterable<AdresseRetourCompositeId> ids);

    @Query(value = "SELECT new fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour(a.id.code, a.id.codeOrganisme, a.adresse1, a.adresse2, a.adresse3, a.adresse4, (COUNT(fich) > 0)) " +
            "FROM AdresseRetourEntity a " +
            "LEFT JOIN FichierEntity fich ON fich.codeAdr = a.id.code and fich.id.codeOrg = a.id.codeOrganisme " +
            "GROUP BY a.id.code, a.id.codeOrganisme " +
            "ORDER BY a.id.code, a.id.codeOrganisme "
    )
    List<AdresseRetour> findAllAdresseRetour();
}

