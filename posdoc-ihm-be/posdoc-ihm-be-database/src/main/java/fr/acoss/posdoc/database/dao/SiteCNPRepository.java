package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.SiteCNPEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface SiteCNPRepository extends GenericRepository<SiteCNPEntity, String> {

    @Query(value = "SELECT new SiteCNPEntity(s.code, s.host, s.username, s.password, s.ressourceDelestage, s.organismeMassification, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM OrganismeEntity o WHERE o.codeSite = s.code) " +
            "       THEN true ELSE false END)) " +
            "FROM SiteCNPEntity s ORDER BY s.code ASC")
    List<SiteCNPEntity> findAllByOrderByCodeAsc();

    @Query("select distinct(organismeMassification) as masorg from SiteCNPEntity ")
    List<String> findAllMasOrgs();

    @Transactional
    void deleteByCodeIn(Iterable<String> codes);
}
