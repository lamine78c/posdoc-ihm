package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.PremasRepository;
import fr.acoss.posdoc.database.entities.PremasCompositeId;
import fr.acoss.posdoc.database.entities.PremasEntity;
import fr.acoss.posdoc.database.mappers.PremasMapper;
import fr.acoss.posdoc.domain.premas.model.DistinctEnvOrgAppModel;
import fr.acoss.posdoc.domain.premas.model.FindPremasQuery;
import fr.acoss.posdoc.domain.premas.model.InvalidateMassificationInput;
import fr.acoss.posdoc.domain.premas.model.Premas;
import fr.acoss.posdoc.domain.premas.secondary.PremasPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PremasPersistenceImpl extends AbstractObjectPersistence<PremasEntity, PremasCompositeId, Premas>
        implements PremasPersistence {

    private static final PremasMapper MAPPER = PremasMapper.INSTANCE;
    private final PremasRepository premasRepository;

    public PremasPersistenceImpl(PremasRepository premasRepository) {
        this.premasRepository = premasRepository;
    }

    @Override
    protected JpaSpecificationExecutor<PremasEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<PremasEntity, PremasCompositeId> getRepository() {
        return null;
    }

    @Override
    protected Function<PremasEntity, Premas> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Premas, PremasEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Premas> findPremas(FindPremasQuery query) {
        List<PremasEntity> requestResult = this.premasRepository.getPremas(query);
        return requestResult.stream()
                .map(e -> entityToDomainFunction().apply(e))
                .collect(Collectors.toList());
    }

    @Override
    public List<DistinctEnvOrgAppModel> getDistinctEnvOrgAppFromPremas() {
        List<Map<String, String>> requestResult = this.premasRepository.getDistinctEnvOrgAppFromPremas();
        return requestResult.stream()
                .map(PremasMapper.INSTANCE::mapToEnvOrgApp)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<Premas> invaliderMassifications(List<InvalidateMassificationInput> massifications, FindPremasQuery query) {
        for (InvalidateMassificationInput input : massifications) {
            //TODO ajout un contrôle ici pour traiter que le statut presta égale à CREE
            this.premasRepository.invalidateMassification(input);
        }
        return findPremas(query);
    }

}
