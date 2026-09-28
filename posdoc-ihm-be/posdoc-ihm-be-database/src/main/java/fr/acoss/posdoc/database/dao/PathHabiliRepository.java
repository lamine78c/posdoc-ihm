package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.PathHabiliEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface PathHabiliRepository extends GenericRepository<PathHabiliEntity, String> {

    String SEP = " > ";
    String MENU = "M";
    String SUBMENU = "S";

    @Query(value = "SELECT p.path as path, " +
            " CASE WHEN h3.text IS NOT NULL THEN CONCAT(h3.text, '"+SEP+"', h2.text, '"+SEP+"', h1.text) ELSE CONCAT(h2.text, '"+SEP+"', h1.text) END as libelle " +
            " FROM profile_habili ph " +
            " JOIN path_habili p ON ph.habili_id = p.habili_id " +
            " LEFT JOIN habili h1 ON h1.id = p.habili_id AND h1.s97_typeit IN ('"+MENU+"', '"+SUBMENU+"') " +
            " LEFT JOIN habili h2 ON h1.parent_id = h2.id  AND h2.s97_typeit IN ('"+MENU+"', '"+SUBMENU+"') " +
            " LEFT JOIN habili h3 ON h2.parent_id = h3.id  AND h3.s97_typeit IN ('"+MENU+"', '"+SUBMENU+"') " +
            " WHERE (:path IS NULL OR p.path = :path) and (:profile IS NULL OR ph.profile_code = :profile) " +
            " ORDER BY " +
            " (CASE WHEN h3.ordre IS NULL THEN h2.ordre ELSE h3.ordre END), " +
            " (CASE WHEN h3.ordre IS NULL THEN h1.ordre ELSE h2.ordre END), " +
            " h1.ordre, p.path", nativeQuery = true)
    List<Map<String, String>> getFullPath(@Param("path") String path, @Param("profile") String profile);
}
