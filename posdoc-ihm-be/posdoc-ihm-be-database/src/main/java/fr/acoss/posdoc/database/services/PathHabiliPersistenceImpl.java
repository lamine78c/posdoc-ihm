package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.PathHabiliRepository;
import fr.acoss.posdoc.database.entities.PathHabiliEntity;
import fr.acoss.posdoc.database.mappers.PathHabiliMapper;
import fr.acoss.posdoc.domain.pathhabili.model.PathHabili;
import fr.acoss.posdoc.domain.pathhabili.secondary.PathHabiliPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PathHabiliPersistenceImpl
        extends AbstractObjectPersistence<PathHabiliEntity, String, PathHabili>
        implements PathHabiliPersistence {

    private static final PathHabiliMapper MAPPER = PathHabiliMapper.INSTANCE;

    private final PathHabiliRepository pathHabiliRepository;

    PathHabiliPersistenceImpl(PathHabiliRepository pathHabiliRepository){
        this.pathHabiliRepository = pathHabiliRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    protected JpaSpecificationExecutor<PathHabiliEntity> getSpecificationExecutor() {
        return pathHabiliRepository;
    }

    @Override
    protected JpaRepository<PathHabiliEntity, String> getRepository() {
        return pathHabiliRepository;
    }

    @Override
    protected Function<PathHabiliEntity, PathHabili> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<PathHabili, PathHabiliEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<PathHabili> selectAll() {
        return this.pathHabiliRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public String getPathCompletByPath(String path) {
        List<Map<String, String>> result = this.pathHabiliRepository.getFullPath(path, null);
        if (result.isEmpty()) {
            return null;
        }
        return result.get(0).get(ParamsUtils.LIBELLE);
    }

    @Override
    public List<Map<String, String>> getAllPathComplet() {
        Context context = ContextHolder.getContext();
        String profileCode = context.getProfile() != null ? context.getProfile().toString() : null;
        return this.pathHabiliRepository.getFullPath(null, profileCode);
    }
}