package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourceCodeEnvOrgsAppDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreEditionPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/parametre-edition/insert-parametre-edition.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/parametre-edition/clean-parametre-edition.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

class ParametreEditionTest extends AbstractGraphqlTest {

    public ObjectNode createVariables(final String reference, final String type,
                                      final String libelle, final Integer lineNumber,
                                      final Integer columnNumber, final Integer length) {
        final var variables = new ObjectMapper().createObjectNode();
        final var parameter = variables.putObject("var");
        parameter.put("reference", reference);
        parameter.put("type", type);
        parameter.put("libelle", libelle);
        parameter.put("lineNumber", lineNumber);
        parameter.put("columnNumber",  columnNumber);
        parameter.put("length", length);
        return variables;
    }

    @Test
    void create_and_update_parametre_edition_ok() throws IOException {

        final var createVariables = createVariables("ref", "T", "libelle", 1, 2, 3);

        final var createResponse = graphQLTestTemplate.perform("graphql-requests/parametre-edition/create-parametre-edition.graphql",
                createVariables);
        assertNotNull(createResponse);
        assertTrue(createResponse.isOk());
        final var updateVariables = createVariables("ref", "T", "libelle_", 1, 2, 3);
        final var responseUpdate = graphQLTestTemplate.perform("graphql-requests/parametre-edition/update-parametre-edition.graphql",
                updateVariables);
        assertNotNull(responseUpdate);
        assertTrue(responseUpdate.isOk());
    }

    @Test
    void list_parametre_edition_ok() throws IOException {
        final var createVariables = createVariables("ref", "T", "libelle", 1, 2, 3);
        final var createResponse = graphQLTestTemplate.perform("graphql-requests/parametre-edition/create-parametre-edition.graphql",
                createVariables);
        assertNotNull(createResponse);
        assertTrue(createResponse.isOk());

        final var createVariables2 = createVariables("ref1", "T", "libelle_", 1, 2, 3);
        final var createResponse2 = graphQLTestTemplate.perform("graphql-requests/parametre-edition/create-parametre-edition.graphql",
                createVariables2);
        assertNotNull(createResponse2);
        assertTrue(createResponse2.isOk());

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-edition/all-parametre-edition.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<CreateOrUpdateParametreEditionPayloadDTO> allParameters = response.getList("$.data.allParametresEdition", CreateOrUpdateParametreEditionPayloadDTO.class);
        assertEquals(2, allParameters.size());
    }

    @Test
    void delete_parametre_edition_ok() throws IOException {
        final var createVariables = createVariables("ref", "T", "libelle", 1, 2, 3);
        final var createResponse = graphQLTestTemplate.perform("graphql-requests/parametre-edition/create-parametre-edition.graphql",
                createVariables);
        assertNotNull(createResponse);
        assertTrue(createResponse.isOk());

        var response = graphQLTestTemplate.perform("graphql-requests/parametre-edition/all-parametre-edition.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<CreateOrUpdateParametreEditionPayloadDTO> allParameters = response.getList("$.data.allParametresEdition", CreateOrUpdateParametreEditionPayloadDTO.class);
        assertEquals(1, allParameters.size());


        final var deleteVariables = new ObjectMapper().createObjectNode();
        final var params = deleteVariables.putObject("var");
        params.put("ids", "ref");

        final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/parametre-edition/delete-parametre-edition.graphql",
                deleteVariables);
        assertNotNull(deleteResponse);
        assertTrue(deleteResponse.isOk());

        response = graphQLTestTemplate.perform("graphql-requests/parametre-edition/all-parametre-edition.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        allParameters = response.getList("$.data.allParametresEdition", CreateOrUpdateParametreEditionPayloadDTO.class);
        assertEquals(0, allParameters.size());

    }

    @Test
    void parametres_edition_pagination_should_be_ok() throws IOException {
        // Créer plusieurs paramètres pour tester la pagination
        final var createVariables1 = createVariables("ref1", "T", "libelle1", 1, 2, 3);
        final var createResponse1 = graphQLTestTemplate.perform("graphql-requests/parametre-edition/create-parametre-edition.graphql",
                createVariables1);
        assertNotNull(createResponse1);
        assertTrue(createResponse1.isOk());

        final var createVariables2 = createVariables("ref2", "T", "libelle2", 2, 3, 4);
        final var createResponse2 = graphQLTestTemplate.perform("graphql-requests/parametre-edition/create-parametre-edition.graphql",
                createVariables2);
        assertNotNull(createResponse2);
        assertTrue(createResponse2.isOk());

        // Tester la pagination
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("page", 0);
        variables.put("size", 10);

        final var sort = new ObjectMapper().createObjectNode();
        sort.put("column", "reference");
        sort.put("direction", "ASCENDING");
        variables.putArray("sort").add(sort);

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-edition/parametres-edition.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Integer totalElement = response.get("$.data.parametresEdition.totalElement", Integer.class);
        assertEquals(2, totalElement);
    }

    @Test
    void get_ressources_by_code_env_orgs_app_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var payload = variables.putObject("payload");
        payload.put("codenv", "P");
        payload.put("codapp", "SNV2");
        payload.put("isProfilAdmin", false);

        final ArrayNode codorgs = payload.putArray("codorgs");
        codorgs.add("117");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-edition/get-ressources-by-code-env-orgs-app.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<RessourceCodeEnvOrgsAppDTO> ressources = response.getList("$.data.getRessourcesByCodeEnvOrgsApp", RessourceCodeEnvOrgsAppDTO.class);
        assertNotNull(ressources);
        assertEquals(2, ressources.size()); // 117 et 999 (avec profil NULL uniquement)
    }

    @Test
    void get_code_destinataires_by_code_orgs_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final ArrayNode codorgs = variables.putArray("codorgs");
        codorgs.add("117");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-edition/get-code-destinataires-by-code-orgs.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> destinataires = response.getList("$.data.getCodeDestinatairesByCodeOrgs", String.class);
        assertNotNull(destinataires);
        assertEquals(2, destinataires.size()); // DEST01 et DEST02
    }
}
