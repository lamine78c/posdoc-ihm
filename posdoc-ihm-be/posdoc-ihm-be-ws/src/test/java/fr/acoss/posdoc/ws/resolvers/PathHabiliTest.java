package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.pathhabili.model.PathHabiliCompletDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/path-habili/insert-path-habili.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/path-habili/clean-path-habili.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class PathHabiliTest extends AbstractGraphqlTest {

    @Test
    void get_path_complet_by_path_ok() throws IOException {
        var variables = new ObjectMapper().createObjectNode();
        variables.put("path", "/admin/organisme#organismes");
        var response = graphQLTestTemplate.perform("graphql-requests/path-habili/get_path_complet_by_path.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("Administration > Organisme > Organismes", response.get("$.data.getPathCompletByPath"));

        variables.put("path", "/admin/habilitation");
        response = graphQLTestTemplate.perform("graphql-requests/path-habili/get_path_complet_by_path.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("Administration > Habilitations", response.get("$.data.getPathCompletByPath"));

        variables.put("path", "/path/not/exist");
        response = graphQLTestTemplate.perform("graphql-requests/path-habili/get_path_complet_by_path.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertNull(response.get("$.data.getPathCompletByPath"));
    }

    @Test
    void get_all_path_complet_ok() throws IOException {
        graphQLTestTemplate.addHeader("profile", "NAT_ADMINISTRATEUR");
        final var response = graphQLTestTemplate.postForResource("graphql-requests/path-habili/get_all_path_complet.graphql");
        graphQLTestTemplate.clearHeaders();
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(4, response.getList("$.data.getAllPathComplet", PathHabiliCompletDTO.class).size());

    }
}
