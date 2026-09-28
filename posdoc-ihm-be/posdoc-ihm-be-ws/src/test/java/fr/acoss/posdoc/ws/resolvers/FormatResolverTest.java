package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.FormatRepository;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFormatPayloadDTO;
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

@Sql(scripts = {"classpath:sql/format/insert-format.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/format/clean-format.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class FormatResolverTest extends AbstractGraphqlTest {

    @Autowired
    private FormatRepository formatRepository;

    @BeforeEach
    void setUp() {
        Context context = new Context();
        context.setUser("testUser");
        context.setHost("127.0.0.1");
        ContextHolder.setContext(context);
    }

    @Test
    void get_formats_paginated_should_return_records() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var queryInput = variables.putObject("queryParametersInputDTO");
        final var paginationParams = queryInput.putObject("paginationParameters");
        paginationParams.put("page", 0);
        paginationParams.put("size", 10);
        paginationParams.putArray("sort");

        final var response = graphQLTestTemplate.perform("graphql-requests/format/formats-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.formats", PaginatedDTO.class);
        assertNotNull(paginated);
        assertTrue(paginated.getTotalElement() >= 3);

        List<CreateOrUpdateFormatPayloadDTO> formats = response.getList("$.data.formats.elements", CreateOrUpdateFormatPayloadDTO.class);
        assertTrue(formats.size() >= 3);
    }

    @Test
    void get_all_formats_should_return_all_records() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/format/all-formats.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateFormatPayloadDTO> formats = response.getList("$.data.allFormats", CreateOrUpdateFormatPayloadDTO.class);
        assertNotNull(formats);
        assertTrue(formats.size() >= 3);

        CreateOrUpdateFormatPayloadDTO firstFormat = formats.stream()
                .filter(f -> "A".equals(f.getCode()))
                .findFirst()
                .orElse(null);
        assertNotNull(firstFormat);
        assertEquals("A", firstFormat.getCode());
        assertEquals("Format Test A", firstFormat.getLibelle());
    }

    @Test
    void delete_formats_should_remove_records() throws IOException {
        assertTrue(formatRepository.findById("B").isPresent());
        assertTrue(formatRepository.findById("C").isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deletesDTO");
        final var idsArray = deleteInput.putArray("ids");
        idsArray.add("B");
        idsArray.add("C");

        final var response = graphQLTestTemplate.perform("graphql-requests/format/delete-formats.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deleteFormats.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(formatRepository.findById("B").isPresent());
        assertFalse(formatRepository.findById("C").isPresent());
    }

    @Test
    void get_formats_paginated_should_filter_by_code() throws IOException {
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

        final var response = graphQLTestTemplate.perform("graphql-requests/format/formats-paginated.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        PaginatedDTO paginated = response.get("$.data.formats", PaginatedDTO.class);
        assertNotNull(paginated);
        assertEquals(1, paginated.getTotalElement());

        List<CreateOrUpdateFormatPayloadDTO> formats = response.getList("$.data.formats.elements", CreateOrUpdateFormatPayloadDTO.class);
        assertEquals(1, formats.size());
        assertEquals("A", formats.get(0).getCode());
    }

    @Test
    void create_format_should_add_new_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("createDTO");
        createInput.put("code", "D");
        createInput.put("libelle", "Nouveau Format D");

        final var response = graphQLTestTemplate.perform("graphql-requests/format/create-format.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateFormatPayloadDTO created = response.get("$.data.createFormat", CreateOrUpdateFormatPayloadDTO.class);
        assertNotNull(created);
        assertEquals("D", created.getCode());
        assertEquals("Nouveau Format D", created.getLibelle());

        Optional<fr.acoss.posdoc.database.entities.FormatEntity> inDb = formatRepository.findById("D");
        assertTrue(inDb.isPresent());
        assertEquals("Nouveau Format D", inDb.get().getLibelle());
    }

    @Test
    void update_format_should_modify_existing_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateInput = variables.putObject("updateDTO");
        updateInput.put("code", "A");
        updateInput.put("libelle", "Format Test A - Modifié");

        final var response = graphQLTestTemplate.perform("graphql-requests/format/update-format.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateFormatPayloadDTO updated = response.get("$.data.updateFormat", CreateOrUpdateFormatPayloadDTO.class);
        assertNotNull(updated);
        assertEquals("A", updated.getCode());
        assertEquals("Format Test A - Modifié", updated.getLibelle());

        Optional<fr.acoss.posdoc.database.entities.FormatEntity> updatedInDb = formatRepository.findById("A");
        assertTrue(updatedInDb.isPresent());
        assertEquals("Format Test A - Modifié", updatedInDb.get().getLibelle());
    }
}
