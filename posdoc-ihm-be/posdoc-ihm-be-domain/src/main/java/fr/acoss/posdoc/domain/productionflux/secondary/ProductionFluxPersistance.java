package fr.acoss.posdoc.domain.productionflux.secondary;

import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.domain.productionflux.model.ProductionFlux;

import java.util.List;

public interface ProductionFluxPersistance {


    List<ProductionFlux> selectAll();

    ProductionFlux create(Client client);

    ProductionFlux update(ProductionFlux productionFlux);

    void delete(String code);

    void deleteAll(Iterable<Integer> ids);

    boolean exists(String code);
}
