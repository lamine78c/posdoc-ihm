package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.TarposEntity;
import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Repository
public interface TarposRepository extends GenericRepository<TarposEntity, String> {

    @Query(value = "SELECT new fr.acoss.posdoc.domain.tarpos.model.Tarpos(t.type, t.libelle, t.ordre, t.tlibre, t.compta, t.perime) " +
            " FROM TarposEntity t " +
            " WHERE t.perime = 0 " +
            " ORDER BY t.ordre "
    )
    List<Tarpos> findTarposByPerimetre();

    @Query("SELECT t FROM TarposEntity t " +
            "WHERE t.compta = 0")
    List<TarposEntity> findTarposByCompta();

    @Query(value = "SELECT t.type as type, t.libelle as libelle, t.ordre as ordre, t.tlibre as tlibre, t.compta as compta," +
            " t.perime as perime, EXISTS (SELECT 1 FROM GenTarEntity g WHERE g.id.c45Typtar = t.type) as isNotAuthorisedToBeDeleted " +
            " FROM TarposEntity t" +
            " GROUP BY t.type")
    List<Map<String, Object>> selectAllTarposWithAuthorisation();

    @Transactional
    void deleteByTypeIn(Collection<String> type);
}

