package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.StaInfRepository;
import fr.acoss.posdoc.database.entities.StaInfCompositeId;
import fr.acoss.posdoc.database.entities.StaInfEntity;
import fr.acoss.posdoc.database.mappers.StaInfMapper;
import fr.acoss.posdoc.domain.stainf.model.StaInf;
import fr.acoss.posdoc.domain.stainf.secondary.StaInfPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StaInfPersistenceImpl extends AbstractObjectPersistence<StaInfEntity, StaInfCompositeId, StaInf>
        implements StaInfPersistence {

    private static final StaInfMapper MAPPER = StaInfMapper.INSTANCE;

    private final StaInfRepository staInfRepository;

    public StaInfPersistenceImpl(
            StaInfRepository staInfRepository) {this.staInfRepository = staInfRepository;}

    @Override
    protected JpaSpecificationExecutor<StaInfEntity> getSpecificationExecutor() {
        return staInfRepository;
    }

    @Override
    protected JpaRepository<StaInfEntity, StaInfCompositeId> getRepository() {
        return staInfRepository;
    }

    @Override
    protected Function<StaInfEntity, StaInf> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<StaInf, StaInfEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    @Transactional
    public List<StaInf> selectAll() {
        return staInfRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e))
                .collect(Collectors.toList());
    }
}
