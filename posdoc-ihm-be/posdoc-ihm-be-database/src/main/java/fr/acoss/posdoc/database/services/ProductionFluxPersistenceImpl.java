package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.DcaProductionFluxRepository;
import fr.acoss.posdoc.database.entities.DcaProductionFluxEntity;
import fr.acoss.posdoc.database.mappers.DcaProductionFluxMapper;
import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.domain.productionflux.model.ProductionFlux;
import fr.acoss.posdoc.domain.productionflux.secondary.ProductionFluxPersistance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductionFluxPersistenceImpl extends AbstractObjectPersistence<DcaProductionFluxEntity, Integer, ProductionFlux>
    implements ProductionFluxPersistance {

  private static final DcaProductionFluxMapper MAPPER = DcaProductionFluxMapper.INSTANCE;

  private final DcaProductionFluxRepository dcaProductionFluxRepository;

  public ProductionFluxPersistenceImpl(
          DcaProductionFluxRepository dcaProductionFluxRepository) {this.dcaProductionFluxRepository = dcaProductionFluxRepository;}

  @Override
  protected JpaSpecificationExecutor<DcaProductionFluxEntity> getSpecificationExecutor() {
    return dcaProductionFluxRepository;
  }

  @Override
  protected JpaRepository<DcaProductionFluxEntity, Integer> getRepository() {
    return dcaProductionFluxRepository;
  }

  @Override
  protected Function<DcaProductionFluxEntity, ProductionFlux> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<ProductionFlux, DcaProductionFluxEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<ProductionFlux> selectAll() {
    return dcaProductionFluxRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public ProductionFlux create(Client productionFlux) {
    //Do nothing
    return null;
  }

  @Override
  public void delete(String code) {
    // Do nothing
    throw new UnsupportedOperationException();
  }

  @Override
  public void deleteAll(Iterable<Integer> ids) {
    dcaProductionFluxRepository.deleteByIdIn(ids);
  }

  @Override
  public boolean exists(String code) {
    return false;
  }


}
