package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genfic.model.ReeditionProduit;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class GenFicTest extends AbstractGraphqlTest {
    @Test
    void get_ressource_codes_by_envs_and_orgs_and_apps_and_sites_and_gammes_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        String codeEnv = "T";
        String codeApp = "SNV2";
        String periode = "240523-00";
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("904");
        variables.put("codenv", codeEnv);
        variables.set("codorg", codesOrg);
        variables.put("codapp", codeApp);
        variables.put("periode", periode);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/genfic/get-commande-from-genfic-with-app.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> responseList = response.getList("$.data.getCommandeFromGenficWithApp", String.class);

        assertEquals(1, responseList.size());
        assertEquals("RDEH", responseList.get(0));
    }

    @Test
    void get_fichier_codes_by_env_and_orgs_and_app_and_percod_and_com_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        String codeEnv = "T";
        String codeApp = "SNV2";
        String periode = "240523-00";
        String commande = "RDEH";
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("904");
        variables.put("codenv", codeEnv);
        variables.set("codorg", codesOrg);
        variables.put("codapp", codeApp);
        variables.put("periode", periode);
        variables.put("commande", commande);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/genfic/get-fichier-codes-by-env-and-orgs-and-app-and-percod-and-com.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> responseList = response.getList("$.data.getFichierFromGenficWithApp", String.class);

        assertEquals(1, responseList.size());
        assertEquals("L02", responseList.get(0));
    }

    @Test
    void search_reedition_per_produit_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        String codeEnv = "T";
        String application = "SNV2";
        String periode = "240523-00";
        String codcom = "RDEH";
        String codfic = "L02";
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("904");
        variables.put("codenv", codeEnv);
        variables.set("codorg", codesOrg);
        variables.put("application", application);
        variables.put("periode", periode);
        variables.put("codcom", codcom);
        variables.put("codfic", codfic);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/reedition-produit/search-reedition-per-produit.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<ReeditionProduit> responseList = response.getList("$.data.searchReeditionPerProduit", ReeditionProduit.class);

        assertEquals(1, responseList.size());
        assertEquals(codcom, responseList.get(0).getCodcom());
    }
}
