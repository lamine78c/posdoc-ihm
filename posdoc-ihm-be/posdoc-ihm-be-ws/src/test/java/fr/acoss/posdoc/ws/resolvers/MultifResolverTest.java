package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.MultifRepository;
import fr.acoss.posdoc.database.entities.MultifEntity;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateMultifPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/multif/insert-multif.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/multif/clean-multif.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class MultifResolverTest extends AbstractGraphqlTest {

    @Autowired
    private MultifRepository multifRepository;

    @BeforeEach
    void setUp() {
        Context context = new Context();
        context.setUser("testUser");
        context.setHost("127.0.0.1");
        ContextHolder.setContext(context);
    }

    @Test
    void get_multifs_paginated_should_return_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var response = graphQLTestTemplate.perform("graphql-requests/multif/multifs-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.multifs", PaginatedDTO.class);
        assertNotNull(paginated);
        assertTrue(paginated.getTotalElement() >= 3);
    }

    @Test
    void get_multifs_paginated_should_filter_by_code() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var filterCriteria = queryInput.putObject("filterCriteria");
        final var filtersArray = filterCriteria.putArray("criteria");
        final var filter = filtersArray.addObject();
        filter.put("column", "code");
        filter.put("operation", "EQUALS");
        filter.put("value", "X");

        final var response = graphQLTestTemplate.perform("graphql-requests/multif/multifs-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.multifs", PaginatedDTO.class);
        assertNotNull(paginated);
        assertEquals(1, paginated.getTotalElement());
    }

    @Test
    void get_all_multifs_should_return_all_records() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/multif/all-multifs.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateMultifPayloadDTO> multifs = response.getList("$.data.allMultifs", CreateOrUpdateMultifPayloadDTO.class);
        assertNotNull(multifs);
        assertTrue(multifs.size() >= 3);

        CreateOrUpdateMultifPayloadDTO firstMultif = multifs.stream()
                .filter(m -> "X".equals(m.getCode()))
                .findFirst()
                .orElse(null);
        assertNotNull(firstMultif);
        assertEquals("X", firstMultif.getCode());
        assertEquals("Multif Test X", firstMultif.getLibelle());
    }

    @Test
    void create_multif_should_add_new_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("createDTO");
        createInput.put("code", "W");
        createInput.put("libelle", "Nouveau Multif W");

        final var response = graphQLTestTemplate.perform("graphql-requests/multif/create-multif.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateMultifPayloadDTO created = response.get("$.data.createMultif", CreateOrUpdateMultifPayloadDTO.class);
        assertNotNull(created);
        assertEquals("W", created.getCode());
        assertEquals("Nouveau Multif W", created.getLibelle());

        Optional<MultifEntity> inDb = multifRepository.findById("W");
        assertTrue(inDb.isPresent());
        assertEquals("Nouveau Multif W", inDb.get().getLibelle());
    }

    @Test
    void update_multif_should_modify_existing_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateInput = variables.putObject("updateDTO");
        updateInput.put("code", "X");
        updateInput.put("libelle", "Multif Test X - Modifié");

        final var response = graphQLTestTemplate.perform("graphql-requests/multif/update-multif.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateMultifPayloadDTO updated = response.get("$.data.updateMultif", CreateOrUpdateMultifPayloadDTO.class);
        assertNotNull(updated);
        assertEquals("X", updated.getCode());
        assertEquals("Multif Test X - Modifié", updated.getLibelle());

        Optional<MultifEntity> updatedInDb = multifRepository.findById("X");
        assertTrue(updatedInDb.isPresent());
        assertEquals("Multif Test X - Modifié", updatedInDb.get().getLibelle());
    }

    @Test
    void delete_multifs_should_remove_records() throws IOException {
        assertTrue(multifRepository.findById("Y").isPresent());
        assertTrue(multifRepository.findById("Z").isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deletesDTO");
        final var idsArray = deleteInput.putArray("ids");
        idsArray.add("Y");
        idsArray.add("Z");

        final var response = graphQLTestTemplate.perform("graphql-requests/multif/delete-multifs.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteMultifs.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(multifRepository.findById("Y").isPresent());
        assertFalse(multifRepository.findById("Z").isPresent());
    }
}
