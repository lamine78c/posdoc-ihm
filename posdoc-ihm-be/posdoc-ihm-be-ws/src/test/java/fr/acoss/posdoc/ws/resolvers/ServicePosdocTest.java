package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdoc;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdocInput;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@Sql(scripts = {"classpath:sql/service/insert-service.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/service/clean-service.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ServicePosdocTest extends AbstractGraphqlTest {

    @MockBean
    private RestTemplate restTemplate;

    @Test
    void find_all_services_ok() throws IOException {
        final var response = graphQLTestTemplate.postForResource("graphql-requests/service/find_all_services.graphql");
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(3, response.getList("$.data.findAllServices", ServicePosdoc.class).size());
    }

    @Test
    void delete_un_service_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var ids = List.of("1", "2");
        variables.set("ids", new ObjectMapper().valueToTree(ids));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/delete-services.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
    }

    @Test
    void create_un_service_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var service = new ServicePosdocInput();
        service.setLibelle("test5");
        service.setUrl("http://google.fr");
        variables.set("var", new ObjectMapper().valueToTree(service));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/create-services.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
    }

    @Test
    void create_un_service_libelle_exist() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var service = new ServicePosdocInput();
        service.setLibelle("test1");
        service.setUrl("http://google.fr");
        variables.set("var", new ObjectMapper().valueToTree(service));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/create-services.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'élément Service (test1) est déjà existant",  response.get("$.errors[0].message"));
    }

    @Test
    void create_un_service_url_not_valid() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var service = new ServicePosdocInput();
        service.setLibelle("test11");
        service.setUrl("aa.fr");
        variables.set("var", new ObjectMapper().valueToTree(service));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/create-services.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'URL n'est pas valide",  response.get("$.errors[0].message"));
    }

    @Test
    void update_un_service_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var service = new ServicePosdocInput();
        service.setId(1);
        service.setLibelle("test1 modifié");
        service.setUrl("http://google.fr");
        variables.set("var", new ObjectMapper().valueToTree(service));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/update-services.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
    }

    @Test
    void update_un_service_not_exist() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var service = new ServicePosdocInput();
        service.setId(999);
        service.setLibelle("inconnu");
        service.setUrl("http://google.fr");
        variables.set("var", new ObjectMapper().valueToTree(service));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/update-services.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("L'élément Service (999) n'existe pas",  response.get("$.errors[0].message"));
    }

    @Test
    void check_service_health_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final String testUrl = "http://test-service.com/health";
        final String expectedResponse = "OK";
        variables.put("url", testUrl);

        when(restTemplate.getForObject(testUrl, String.class)).thenReturn(expectedResponse);

        final var response = graphQLTestTemplate.perform("graphql-requests/service/check-service-health.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(expectedResponse, response.get("$.data.checkServiceHealth"));
    }

    @Test
    void check_service_health_error() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final String testUrl = "http://invalid-service.com/health";
        variables.put("url", testUrl);

        when(restTemplate.getForObject(testUrl, String.class))
                .thenThrow(new RestClientException("Connection refused"));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/check-service-health.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("Erreur lors de la vérification du service " + testUrl + ": Connection refused",
                response.get("$.errors[0].message"));
    }

    @Test
    void check_service_health_timeout() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final String testUrl = "http://slow-service.com/health";
        variables.put("url", testUrl);

        when(restTemplate.getForObject(testUrl, String.class))
                .thenThrow(new RestClientException("Read timed out"));

        final var response = graphQLTestTemplate.perform("graphql-requests/service/check-service-health.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("Erreur lors de la vérification du service " + testUrl + ": Read timed out",
                response.get("$.errors[0].message"));
    }
}
