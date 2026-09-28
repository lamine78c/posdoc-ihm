package fr.acoss.posdoc.domain.pathhabili.secondary;

import fr.acoss.posdoc.domain.pathhabili.model.PathHabili;

import java.util.List;
import java.util.Map;

public interface PathHabiliPersistence {
    String getPathCompletByPath(String path);

    List<Map<String, String>> getAllPathComplet();

    List<PathHabili> selectAll();
}
