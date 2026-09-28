package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.MassificationRepository;
import fr.acoss.posdoc.database.entities.GenFicCompositeId;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.database.mappers.OccurrenceEtapeMapper;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationOccurrenceEtape;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationPayload;
import fr.acoss.posdoc.domain.occurrence.etape.secondary.OccurrenceEtapeDetailsMassificationPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OccurrenceEtapeDetailsMassificationPersistenceImpl
        extends AbstractObjectPersistence<GenFicEntity, GenFicCompositeId, DetailsMassificationOccurrenceEtape>
        implements OccurrenceEtapeDetailsMassificationPersistence {

    private static final OccurrenceEtapeMapper MAPPER = OccurrenceEtapeMapper.INSTANCE;

    private final MassificationRepository massificationRepository;

    public OccurrenceEtapeDetailsMassificationPersistenceImpl(MassificationRepository repository) {
        this.massificationRepository = repository;
    }

    @Override
    protected JpaSpecificationExecutor<GenFicEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<GenFicEntity, GenFicCompositeId> getRepository() {
        return null;
    }

    @Override
    protected Function<GenFicEntity, DetailsMassificationOccurrenceEtape> entityToDomainFunction() {
        return MAPPER::genFicEntityToDetailsMassification;
    }

    @Override
    protected Function<DetailsMassificationOccurrenceEtape, GenFicEntity> domainToEntityFunction() {
        return MAPPER::detailsMassificationToGenFicEntity;
    }

    @Override
    public List<DetailsMassificationOccurrenceEtape> findDetailsMassificationForOccurrenceEtape(DetailsMassificationPayload payload) {
        List<GenFicEntity> requestResult = this.massificationRepository.findDetailsMassificationForOccurrenceEtape(payload);
        return requestResult.stream()
                .map(e -> entityToDomainFunction().apply(e))
                .collect(Collectors.toList());
    }
}
