package fr.acoss.posdoc.domain.productionflux.primary;


import fr.acoss.posdoc.domain.productionflux.secondary.ProductionFluxPersistance;

public class ProductionFluxService {

    private ProductionFluxPersistance productionFluxPersistance;

    public ProductionFluxService(final ProductionFluxPersistance productionFluxPersistance) {
        this.productionFluxPersistance = productionFluxPersistance;
    }

    public void deleteProductionFlux(Iterable<Integer> ids) {
        productionFluxPersistance.deleteAll(ids);
    }
}
