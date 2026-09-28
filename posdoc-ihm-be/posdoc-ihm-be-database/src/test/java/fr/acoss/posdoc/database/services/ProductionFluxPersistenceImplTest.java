package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.DcaProductionFluxRepository;
import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.domain.productionflux.model.ProductionFlux;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.transaction.Transactional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/production-flux/insert-production-flux.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/production-flux/clean-production-flux.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ProductionFluxPersistenceImplTest {

    @Autowired
    private ProductionFluxPersistenceImpl productionFluxPersistence;

    @Autowired
    private DcaProductionFluxRepository dcaProductionFluxRepository;

    @Test
    void selectAll_should_return_all_production_flux() {
        List<ProductionFlux> result = productionFluxPersistence.selectAll();

        assertNotNull(result);
        assertEquals(3, result.size());

        ProductionFlux first = result.stream()
                .filter(f -> Integer.valueOf(1).equals(f.getId()))
                .findFirst()
                .orElse(null);
        assertNotNull(first);
        assertEquals("archive_1.zip", first.getNomArchiveRetour());
        assertEquals("retour_1.txt", first.getNomFichierRetour());
        assertEquals(Integer.valueOf(100), first.getNombrePlisFabriques());
    }

    @Test
    @Transactional
    void deleteAll_should_remove_production_flux_by_ids() {
        assertTrue(dcaProductionFluxRepository.findById(2).isPresent());
        assertTrue(dcaProductionFluxRepository.findById(3).isPresent());

        productionFluxPersistence.deleteAll(List.of(2, 3));

        assertFalse(dcaProductionFluxRepository.findById(2).isPresent());
        assertFalse(dcaProductionFluxRepository.findById(3).isPresent());
        assertTrue(dcaProductionFluxRepository.findById(1).isPresent());
    }

    @Test
    void create_should_do_nothing_and_return_null() {
        assertNull(productionFluxPersistence.create((Client) null));
    }

    @Test
    void delete_should_throw_unsupported_operation() {
        assertThrows(UnsupportedOperationException.class, () -> productionFluxPersistence.delete("any"));
    }

    @Test
    void exists_should_always_return_false() {
        assertFalse(productionFluxPersistence.exists("any"));
    }
}
