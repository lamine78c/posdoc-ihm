package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.HabilitationRepository;
import fr.acoss.posdoc.database.entities.HabilitationEntity;
import fr.acoss.posdoc.database.mappers.HabilitationMapper;
import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import fr.acoss.posdoc.domain.habilitation.secondary.HabilitationPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HabilitationPersistenceImpl extends AbstractObjectPersistence<HabilitationEntity, Integer, Habilitation>
        implements HabilitationPersistence {

    private static final HabilitationMapper MAPPER = HabilitationMapper.INSTANCE;

    private final HabilitationRepository habilitationRepository;

    public HabilitationPersistenceImpl(
            HabilitationRepository habilitationRepository) {this.habilitationRepository = habilitationRepository;}

    @Override
    protected JpaSpecificationExecutor<HabilitationEntity> getSpecificationExecutor() {
        return habilitationRepository;
    }

    @Override
    protected JpaRepository<HabilitationEntity, Integer> getRepository() {
        return habilitationRepository;
    }

    @Override
    protected Function<HabilitationEntity, Habilitation> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Habilitation, HabilitationEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Habilitation> selectAll() {
        return habilitationRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public void deleteAll(Iterable<String> ids) {
        List<Integer> intIds = new java.util.ArrayList<>();
        ids.forEach(id -> intIds.add(Integer.parseInt(id)));
        habilitationRepository.deleteAllById(intIds);
    }

    @Override
    public List<Habilitation> updateAll(List<Habilitation> habilitations) {
        var entity = habilitations.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        return habilitationRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }
}