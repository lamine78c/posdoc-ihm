package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.SuiviMassificationRepository;
import fr.acoss.posdoc.database.entities.GenMasCompositeId;
import fr.acoss.posdoc.database.entities.GenMasEntity;
import fr.acoss.posdoc.database.mappers.SuiviMassificationMapper;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationFiltreDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationPayload;
import fr.acoss.posdoc.domain.suivimassification.secondary.SuiviMassificationPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SuiviMassificationPersistenceImpl extends AbstractObjectPersistence<GenMasEntity, String, GenMasCompositeId> implements SuiviMassificationPersistence {

    private final SuiviMassificationRepository suiviMassificationRepository;

    public SuiviMassificationPersistenceImpl(SuiviMassificationRepository repository) {
        this.suiviMassificationRepository = repository;
    }

    @Override
    protected JpaSpecificationExecutor getSpecificationExecutor() { return this.suiviMassificationRepository; }

    @Override
    protected JpaRepository getRepository() { return this.suiviMassificationRepository; }

    @Override
    protected Function entityToDomainFunction() { return null; }

    @Override
    protected Function domainToEntityFunction() { return null; }

    @Override
    public List<SuiviMassificationFiltreDTO> getDistinctFiltreMassification() {
        return this.suiviMassificationRepository.distinctFiltreMassification()
                .stream().map(SuiviMassificationMapper.INSTANCE::entityToSuiviMassificationFiltre)
                .collect(Collectors.toList());
    }

    @Override
    public List<SuiviMassificationDTO> searchForSuiviMassification(SuiviMassificationPayload payload) {
        String masApp = this.suiviMassificationRepository.suiviMassificationApplication();
        String masGam = this.suiviMassificationRepository.suiviMassificationGamme();
        return this.suiviMassificationRepository.suiviMassification(payload, masApp, masGam)
                .stream().map(SuiviMassificationMapper.INSTANCE::mapToSuiviMassification)
                .collect(Collectors.toList());
    }

    @Override
    public Integer searchCountForSuiviMassification(SuiviMassificationPayload payload) {
        String masApp = this.suiviMassificationRepository.suiviMassificationApplication();
        String masGam = this.suiviMassificationRepository.suiviMassificationGamme();
        return this.suiviMassificationRepository.suiviMassificationCount(payload, masApp, masGam);
    }
}
