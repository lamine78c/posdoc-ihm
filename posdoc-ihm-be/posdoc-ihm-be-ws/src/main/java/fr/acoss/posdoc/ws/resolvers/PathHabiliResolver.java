package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.pathhabili.model.PathHabiliCompletDTO;
import fr.acoss.posdoc.domain.pathhabili.primary.PathHabiliService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PathHabiliResolver extends AbstractQueryResolver {

    private final PathHabiliService pathHabiliService;

    public PathHabiliResolver(final PathHabiliService pathHabiliService) {
        this.pathHabiliService = pathHabiliService;
    }

    public String getPathCompletByPath(String path) {
        return this.pathHabiliService.getPathCompletByPath(path);
    }

    public List<PathHabiliCompletDTO> getAllPathComplet() {
        return pathHabiliService.getAllPathComplet();
    }
}