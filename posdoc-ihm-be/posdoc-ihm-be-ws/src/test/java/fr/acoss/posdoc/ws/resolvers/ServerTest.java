package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ServerRepository;
import fr.acoss.posdoc.types.Systeme;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ServerTest extends AbstractGraphqlTest {

    @Autowired
    private ServerRepository serverRepository;

    @Test
    void test_create_server() throws IOException {

        final var variables = createVariables("ABC", "LINUX", "Libelle", "AdresseIp", true, false);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/server/create-server.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABC", response.get("$.data.createServer.code"));
        assertEquals("LINUX", response.get("$.data.createServer.systeme"));
        assertEquals("Libelle", response.get("$.data.createServer.libelle"));
        assertEquals("AdresseIp", response.get("$.data.createServer.adresseIp"));
        assertEquals("true", response.get("$.data.createServer.teste"));
        assertEquals("false", response.get("$.data.createServer.actif"));

        final var server = serverRepository.findById("ABC").get();
        assertEquals("ABC", server.getCode());
        assertEquals(Systeme.LINUX, server.getSysteme());
        assertEquals("Libelle", server.getLibelle());
        assertEquals("AdresseIp", server.getAdresseIp());
        assertEquals(true, server.getTeste());
        assertEquals(false, server.getActif());

    }

    @Test
    void test_update_server() throws IOException {

        final var variables = createVariables("ABCD", "LINUX", "Libelle", "AdresseIp", true, false);

        graphQLTestTemplate.perform("graphql-requests/server/create-server.graphql", variables);

        final var updateVariables = createVariables("ABCD",
                "WINDOWS",
                "Nouveau libelle",
                "Nouvelle adresse IP",
                false,
                true);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/server/update-server.graphql", updateVariables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABCD", response.get("$.data.updateServer.code"));
        assertEquals("WINDOWS", response.get("$.data.updateServer.systeme"));
        assertEquals("Nouveau libelle", response.get("$.data.updateServer.libelle"));
        assertEquals("Nouvelle adresse IP", response.get("$.data.updateServer.adresseIp"));
        assertEquals("false", response.get("$.data.updateServer.teste"));
        assertEquals("true", response.get("$.data.updateServer.actif"));

        final var server = serverRepository.findById("ABCD").get();
        assertEquals("ABCD", server.getCode());
        assertEquals(Systeme.WINDOWS, server.getSysteme());
        assertEquals("Nouveau libelle", server.getLibelle());
        assertEquals("Nouvelle adresse IP", server.getAdresseIp());
        assertEquals(false, server.getTeste());
        assertEquals(true, server.getActif());

    }

    @Test
    void test_select_servers() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("page", 0);
        variables.put("size", 10);

        final var sort = new ObjectMapper().createObjectNode();
        sort.put("column", "code");
        sort.put("direction", "DESCENDING");

        final var criteria = new ObjectMapper().createObjectNode();
        criteria.put("value", "%ADEL%");
        criteria.put("column", "code");
        criteria.put("operation", "LIKE");

        variables.putArray("sort").add(sort);
        variables.putArray("criteria").add(criteria);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/server/select-server.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        final var paginatedDTO = response.get(
                "$.data.servers",
                PaginatedDTO.class);

        assertEquals(1, paginatedDTO.getTotalPages());
        assertEquals(4, paginatedDTO.getTotalElement());
        assertEquals(4, paginatedDTO.getElements().size());

    }

    public ObjectNode createVariables(final String code, final String systeme, final String libelle,
                                      final String adresseIp, final Boolean teste,
                                      final Boolean actif) {
        final var variables = new ObjectMapper().createObjectNode();
        final var server = variables.putObject("var");
        server.put("code", code);
        server.put("libelle", libelle);
        server.put("systeme", systeme);
        server.put("adresseIp", adresseIp);
        server.put("teste", teste);
        server.put("actif", actif);
        return variables;
    }

}
