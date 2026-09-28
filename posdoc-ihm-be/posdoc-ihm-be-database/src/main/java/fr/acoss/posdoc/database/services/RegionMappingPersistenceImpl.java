package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.RegionMappingRepository;
import fr.acoss.posdoc.database.entities.RegionMappingEntity;
import fr.acoss.posdoc.database.mappers.RegionMappingMapper;
import fr.acoss.posdoc.domain.regionmapping.model.RegionMapping;
import fr.acoss.posdoc.domain.regionmapping.secondary.RegionMappingPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RegionMappingPersistenceImpl extends AbstractObjectPersistence<RegionMappingEntity,String,RegionMapping>  implements RegionMappingPersistence {

    private static final RegionMappingMapper MAPPER = RegionMappingMapper.INSTANCE;

    private final RegionMappingRepository regionMappingRepository;

    public RegionMappingPersistenceImpl(final RegionMappingRepository regionMappingRepository) {
        this.regionMappingRepository = regionMappingRepository;
    }

    @Override
    public List<RegionMapping> findByCodeAnaisIn(final Iterable<String> codeAnais) {
        return regionMappingRepository.findByCodeAnaisIn(codeAnais).stream().map(e->entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    protected JpaSpecificationExecutor<RegionMappingEntity> getSpecificationExecutor() {
        return this.regionMappingRepository;
    }

    @Override
    protected JpaRepository<RegionMappingEntity, String> getRepository() {
        return this.regionMappingRepository;
    }

    @Override
    protected Function<RegionMappingEntity, RegionMapping> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<RegionMapping, RegionMappingEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

}
