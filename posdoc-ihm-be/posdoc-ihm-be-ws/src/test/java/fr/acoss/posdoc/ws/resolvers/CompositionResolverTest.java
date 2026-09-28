package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.CompositionRepository;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateCompositionPayloadDTO;
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

@Sql(scripts = {"classpath:sql/composition/insert-composition.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/composition/clean-composition.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class CompositionResolverTest extends AbstractGraphqlTest {

    @Autowired
    private CompositionRepository compositionRepository;

    @BeforeEach
    void setUp() {
        Context context = new Context();
        context.setUser("testUser");
        context.setHost("127.0.0.1");
        ContextHolder.setContext(context);
    }

    @Test
    void get_compositions_paginated_should_return_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var response = graphQLTestTemplate.perform("graphql-requests/composition/compositions-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.compositions", PaginatedDTO.class);
        assertNotNull(paginated);
        assertTrue(paginated.getTotalElement() >= 3);

        List<CreateOrUpdateCompositionPayloadDTO> compositions = response.getList("$.data.compositions.elements", CreateOrUpdateCompositionPayloadDTO.class);
        assertTrue(compositions.size() >= 3);
    }

    @Test
    void get_all_compositions_should_return_all_records() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/composition/all-compositions.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateCompositionPayloadDTO> compositions = response.getList("$.data.allCompositions", CreateOrUpdateCompositionPayloadDTO.class);
        assertNotNull(compositions);
        assertTrue(compositions.size() >= 3);

        CreateOrUpdateCompositionPayloadDTO firstComposition = compositions.stream()
                .filter(c -> "A".equals(c.getCode()))
                .findFirst()
                .orElse(null);
        assertNotNull(firstComposition);
        assertEquals("A", firstComposition.getCode());
        assertEquals("Composition Test 1", firstComposition.getLibelle());
    }


    @Test
    void delete_compositions_should_remove_records() throws IOException {
        assertTrue(compositionRepository.findById("B").isPresent());
        assertTrue(compositionRepository.findById("C").isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deletesDTO");
        final var idsArray = deleteInput.putArray("ids");
        idsArray.add("B");
        idsArray.add("C");

        final var response = graphQLTestTemplate.perform("graphql-requests/composition/delete-compositions.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteCompositions.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(compositionRepository.findById("B").isPresent());
        assertFalse(compositionRepository.findById("C").isPresent());
    }

    @Test
    void get_compositions_paginated_should_filter_by_code() throws IOException {
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
        filter.put("value", "A");

        final var response = graphQLTestTemplate.perform("graphql-requests/composition/compositions-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.compositions", PaginatedDTO.class);
        assertNotNull(paginated);
        assertEquals(1, paginated.getTotalElement());

        List<CreateOrUpdateCompositionPayloadDTO> compositions = response.getList("$.data.compositions.elements", CreateOrUpdateCompositionPayloadDTO.class);
        assertEquals(1, compositions.size());
        assertEquals("A", compositions.get(0).getCode());
    }

    @Test
    void create_composition_should_add_new_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("createDTO");
        createInput.put("code", "D");
        createInput.put("libelle", "Nouvelle Composition 4");

        final var response = graphQLTestTemplate.perform("graphql-requests/composition/create-composition.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateCompositionPayloadDTO created = response.get("$.data.createComposition", CreateOrUpdateCompositionPayloadDTO.class);
        assertNotNull(created);
        assertEquals("D", created.getCode());
        assertEquals("Nouvelle Composition 4", created.getLibelle());

        Optional<fr.acoss.posdoc.database.entities.CompositionEntity> inDb = compositionRepository.findById("D");
        assertTrue(inDb.isPresent());
        assertEquals("Nouvelle Composition 4", inDb.get().getLibelle());
    }

    @Test
    void update_composition_should_modify_existing_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateInput = variables.putObject("updateDTO");
        updateInput.put("code", "A");
        updateInput.put("libelle", "Composition Test 1 - Modifiée");

        final var response = graphQLTestTemplate.perform("graphql-requests/composition/update-composition.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateCompositionPayloadDTO updated = response.get("$.data.updateComposition", CreateOrUpdateCompositionPayloadDTO.class);
        assertNotNull(updated);
        assertEquals("A", updated.getCode());
        assertEquals("Composition Test 1 - Modifiée", updated.getLibelle());

        Optional<fr.acoss.posdoc.database.entities.CompositionEntity> updatedInDb = compositionRepository.findById("A");
        assertTrue(updatedInDb.isPresent());
        assertEquals("Composition Test 1 - Modifiée", updatedInDb.get().getLibelle());
    }
}
