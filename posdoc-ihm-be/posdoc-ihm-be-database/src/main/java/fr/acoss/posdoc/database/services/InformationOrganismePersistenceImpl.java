package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.InformationOrganismeRepository;
import fr.acoss.posdoc.database.entities.InformationOrganismeEntity;
import fr.acoss.posdoc.database.mappers.InformationOrganismeMapper;
import fr.acoss.posdoc.domain.informationorganisme.model.InformationOrganisme;
import fr.acoss.posdoc.domain.informationorganisme.secondary.InformationOrganismePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class InformationOrganismePersistenceImpl
        extends AbstractObjectPersistence<InformationOrganismeEntity, Integer, InformationOrganisme>
        implements InformationOrganismePersistence {

    private static final InformationOrganismeMapper INFO_ORG_MAPPER = InformationOrganismeMapper.INSTANCE;

    private final InformationOrganismeRepository informationOrganismeRepository;

    public InformationOrganismePersistenceImpl(
            InformationOrganismeRepository informationOrganismeRepository) {
        this.informationOrganismeRepository = informationOrganismeRepository;
    }

    @Override
    public List<InformationOrganisme> create(List<InformationOrganisme> informationOrganismes) {
        final var savedEntities = informationOrganismeRepository.saveAll(informationOrganismes.stream()
                .map(INFO_ORG_MAPPER::domainToEntity).collect(Collectors.toList()));
        return savedEntities.stream().map(INFO_ORG_MAPPER::entityToDomain).collect(Collectors.toList());
    }

    @Override
    protected JpaSpecificationExecutor<InformationOrganismeEntity> getSpecificationExecutor() {
        return informationOrganismeRepository;
    }

    @Override
    protected JpaRepository<InformationOrganismeEntity, Integer> getRepository() {
        return informationOrganismeRepository;
    }

    @Override
    protected Function<InformationOrganismeEntity, InformationOrganisme> entityToDomainFunction() {
        return INFO_ORG_MAPPER::entityToDomain;
    }

    @Override
    protected Function<InformationOrganisme, InformationOrganismeEntity> domainToEntityFunction() {
        return INFO_ORG_MAPPER::domainToEntity;
    }

}
