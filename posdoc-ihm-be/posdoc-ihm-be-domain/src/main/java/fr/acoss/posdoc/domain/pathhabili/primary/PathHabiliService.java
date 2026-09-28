package fr.acoss.posdoc.domain.pathhabili.primary;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.domain.pathhabili.model.PathHabiliCompletDTO;
import fr.acoss.posdoc.domain.pathhabili.secondary.PathHabiliPersistence;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PathHabiliService {
    private final PathHabiliPersistence pathHabiliPersistence;

    public PathHabiliService(final PathHabiliPersistence pathHabiliPersistence) {
        this.pathHabiliPersistence = pathHabiliPersistence;
    }

    public String getPathCompletByPath(String path) {
        return this.pathHabiliPersistence.getPathCompletByPath(path);
    }

    public List<PathHabiliCompletDTO> getAllPathComplet() {
        return this.pathHabiliPersistence.getAllPathComplet().stream().map(this::mapToPathHabiliCompletDTO).collect(Collectors.toList());
    }

    private PathHabiliCompletDTO mapToPathHabiliCompletDTO(Map<String, String> map) {
        return PathHabiliCompletDTO.builder()
                .path(map.get(ParamsUtils.PATH))
                .libelle(map.get(ParamsUtils.LIBELLE))
                .build();
    }
}
