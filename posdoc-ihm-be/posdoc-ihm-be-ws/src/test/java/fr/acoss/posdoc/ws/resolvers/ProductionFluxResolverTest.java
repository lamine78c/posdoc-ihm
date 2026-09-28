package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.DcaProductionFluxRepository;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateProductionFluxPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/production-flux/insert-production-flux.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/production-flux/clean-production-flux.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ProductionFluxResolverTest extends AbstractGraphqlTest {

    @Autowired
    private DcaProductionFluxRepository dcaProductionFluxRepository;

    @Test
    void get_all_production_flux_should_return_all_records() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/production-flux/all-production-flux.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateProductionFluxPayloadDTO> fluxList = response.getList("$.data.allProductionFlux", CreateOrUpdateProductionFluxPayloadDTO.class);
        assertNotNull(fluxList);
        assertEquals(3, fluxList.size());

        CreateOrUpdateProductionFluxPayloadDTO first = fluxList.stream()
                .filter(f -> Integer.valueOf(1).equals(f.getId()))
                .findFirst()
                .orElse(null);
        assertNotNull(first);
        assertEquals("archive_1.zip", first.getNomArchiveRetour());
        assertEquals("retour_1.txt", first.getNomFichierRetour());
        assertEquals(Integer.valueOf(100), first.getNombrePlisFabriques());
        // 2 détails liés via la sous-requête de getProdFluxWithdetails
        assertEquals(Integer.valueOf(2), first.getDetails());
    }

    @Test
    void delete_production_flux_should_remove_records() throws IOException {
        assertTrue(dcaProductionFluxRepository.findById(2).isPresent());
        assertTrue(dcaProductionFluxRepository.findById(3).isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deletesDTO");
        final var idsArray = deleteInput.putArray("ids");
        idsArray.add("2");
        idsArray.add("3");

        final var response = graphQLTestTemplate.perform("graphql-requests/production-flux/delete-production-flux.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteProductionFlux.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(dcaProductionFluxRepository.findById(2).isPresent());
        assertFalse(dcaProductionFluxRepository.findById(3).isPresent());
        assertTrue(dcaProductionFluxRepository.findById(1).isPresent());
    }
}
