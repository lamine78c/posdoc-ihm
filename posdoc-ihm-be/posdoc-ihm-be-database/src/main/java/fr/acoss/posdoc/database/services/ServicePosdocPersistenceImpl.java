package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ServicePosdocRepository;
import fr.acoss.posdoc.database.entities.ServicePosdocEntity;
import fr.acoss.posdoc.database.mappers.ServicePosdocMapper;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdoc;
import fr.acoss.posdoc.domain.serviceposdoc.secondary.ServicePosdocPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ServicePosdocPersistenceImpl
        extends AbstractObjectPersistence<ServicePosdocEntity, Integer, ServicePosdoc>
        implements ServicePosdocPersistence {

    private static final ServicePosdocMapper MAPPER = ServicePosdocMapper.INSTANCE;
    private final ServicePosdocRepository servicePosdocRepository;

    ServicePosdocPersistenceImpl(ServicePosdocRepository servicePosdocRepository){
        this.servicePosdocRepository = servicePosdocRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    protected JpaSpecificationExecutor<ServicePosdocEntity> getSpecificationExecutor() {
        return servicePosdocRepository;
    }

    @Override
    protected JpaRepository<ServicePosdocEntity, Integer> getRepository() {
        return servicePosdocRepository;
    }

    @Override
    protected Function<ServicePosdocEntity, ServicePosdoc> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<ServicePosdoc, ServicePosdocEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<ServicePosdoc> findAll() {
        return this.servicePosdocRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public void deleteAll(Iterable<Integer> ids) {
        this.servicePosdocRepository.deleteByIdIn(ids);
    }

    @Override
    public ServicePosdoc findById(Integer id) {
        return this.servicePosdocRepository.findById(id).map(e -> entityToDomainFunction().apply(e)).orElse(null);
    }

    @Override
    public boolean existsByLibelle(String libelle) {
        return this.servicePosdocRepository.existsByLibelle(libelle);
    }
}
