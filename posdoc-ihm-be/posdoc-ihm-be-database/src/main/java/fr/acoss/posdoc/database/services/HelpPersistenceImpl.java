package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.HelpRepository;
import fr.acoss.posdoc.database.entities.HelpEntity;
import fr.acoss.posdoc.database.mappers.HelpMapper;
import fr.acoss.posdoc.domain.help.model.Help;
import fr.acoss.posdoc.domain.help.secondary.HelpPersistence;
import fr.acoss.posdoc.types.HelpStateType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HelpPersistenceImpl
        extends AbstractObjectPersistence<HelpEntity, Integer, Help>
        implements HelpPersistence {

    private static final HelpMapper MAPPER = HelpMapper.INSTANCE;

    private final HelpRepository helpRepository;

    HelpPersistenceImpl(HelpRepository helpRepository){
        this.helpRepository = helpRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    protected JpaSpecificationExecutor<HelpEntity> getSpecificationExecutor() {
        return helpRepository;
    }

    @Override
    protected JpaRepository<HelpEntity, Integer> getRepository() {
        return helpRepository;
    }

    @Override
    protected Function<HelpEntity, Help> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Help, HelpEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Help> selectAll() {
        return this.helpRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Help> getHelpByPath(String path) {
        return this.helpRepository.findByPath(path).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public Optional<Help> getHelpById(Integer id) {
        return this.helpRepository.findById(id).map(entityToDomainFunction());
    }

    @Override
    public Optional<Help> selectAllByPathAndState(String path, HelpStateType state) {
        return this.helpRepository.findAllByPathAndState(path, state.name()).map(entityToDomainFunction());
    }
}
