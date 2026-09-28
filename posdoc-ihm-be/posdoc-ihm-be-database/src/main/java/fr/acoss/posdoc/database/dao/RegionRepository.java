package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.RegionEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface RegionRepository extends GenericRepository<RegionEntity, String> {

    @Transactional
    void deleteByCodeIn(Iterable<String> codes);

    @Query(value = "SELECT new RegionEntity(r.code, r.libelle, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM OrganismeEntity o WHERE o.codeRegion = r.code) " +
            "       THEN true ELSE false END)) " +
            "FROM RegionEntity r ORDER BY r.code ASC")
    List<RegionEntity> findAllByOrderByCodeAsc();
}
