package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.FormatEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface FormatRepository extends GenericRepository<FormatEntity, String> {

    @Transactional
    void deleteByCodeIn(Iterable<String> codes);

    @Query(value = "SELECT new FormatEntity(f.code, f.libelle, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM FichierEntity fich WHERE fich.typeFormat = f.code) " +
            " OR EXISTS (SELECT 1 FROM ParametreEditionEntity p WHERE p.type = f.code ) " +
            " THEN true ELSE false END)) " +
            " FROM FormatEntity f " +
            " ORDER BY f.code ASC "
    )
    List<FormatEntity> selectAll();

    @Query("select case when (count(f) > 0) then true else false end from FormatEntity f where f.code = :typeFormat")
    boolean existsByType(@Param("typeFormat") String typeFormat);
}
