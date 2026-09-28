package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.SiteCNPRepository;
import fr.acoss.posdoc.database.dao.SiteOrganismeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class SitesResolverTest extends AbstractGraphqlTest {

    @Autowired
    private SiteCNPRepository siteCNPRepository;

    @Autowired
    private SiteOrganismeRepository siteOrganismeRepository;

    @Test
    void test_create_site_organisme() throws IOException {

        final var variables = createSiteOrganismeInput("999", "CIRSO", "CIRSO");

        final var response = graphQLTestTemplate.perform("graphql-requests/sites/organisme/create-sites-organisme.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("999", response.get("$.data.createSiteOrganisme.codeOrganisme"));
        assertEquals("CIRSO", response.get("$.data.createSiteOrganisme.codeSiteDematerialisation"));
        assertEquals("CIRSO", response.get("$.data.createSiteOrganisme.codeSiteProdocs"));

        final var site = siteOrganismeRepository.findById("999").get();
        assertEquals("999", site.getCodeOrganisme());
        assertEquals("CIRSO", site.getCodeSiteDematerialisation());
        assertEquals("CIRSO", site.getCodeSiteProdocs());
    }

    @Test
    void test_update_site_organisme() throws IOException {

        final var variables = createSiteOrganismeInput("901", "CIRTIL", "CIRTIL");

        final var response = graphQLTestTemplate.perform("graphql-requests/sites/organisme/create-sites-organisme.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var updateVariables = createSiteOrganismeInput("901", "CIRSO", "CIRSO");

        final var updateResponse = graphQLTestTemplate.perform("graphql-requests/sites/organisme/update-sites-organisme.graphql",
                updateVariables);

        assertNotNull(updateResponse);
        assertTrue(updateResponse.isOk());
        assertEquals("901", updateResponse.get("$.data.updateSiteOrganisme.codeOrganisme"));
        assertEquals("CIRSO",
                updateResponse.get("$.data.updateSiteOrganisme.codeSiteDematerialisation"));
        assertEquals("CIRSO", updateResponse.get("$.data.updateSiteOrganisme.codeSiteProdocs"));

        final var site = siteOrganismeRepository.findById("901").get();
        assertEquals("901", site.getCodeOrganisme());
        assertEquals("CIRSO", site.getCodeSiteDematerialisation());
        assertEquals("CIRSO", site.getCodeSiteProdocs());

    }

    public ObjectNode createSiteOrganismeInput(final String codeOrganisme,
                                               final String codeSiteDematerialisation,
                                               final String codeSiteProdocs) {
        final var variables = new ObjectMapper().createObjectNode();
        final var server = variables.putObject("var");
        server.put("codeOrganisme", codeOrganisme);
        server.put("codeSiteDematerialisation", codeSiteDematerialisation);
        server.put("codeSiteProdocs", codeSiteProdocs);
        return variables;
    }

    @Test
    void test_create_site_cnp() throws IOException {

        final var variables = createSiteCNPInput("INTEGR",
                "adelaide64d3.cnp75.recouv",
                "adel",
                "m02passadl",
                "CNP-31",
                "00T");

        final var response = graphQLTestTemplate.perform("graphql-requests/sites/cnp/create-sites-cnp.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("INTEGR", response.get("$.data.createSiteCNP.code"));
        assertEquals("adelaide64d3.cnp75.recouv", response.get("$.data.createSiteCNP.host"));
        assertEquals("adel", response.get("$.data.createSiteCNP.username"));
        assertEquals("m02passadl", response.get("$.data.createSiteCNP.password"));
        assertEquals("CNP-31", response.get("$.data.createSiteCNP.ressourceDelestage"));
        assertEquals("00T", response.get("$.data.createSiteCNP.organismeMassification"));

        final var site = siteCNPRepository.findById("INTEGR").get();
        assertEquals("INTEGR", site.getCode());
        assertEquals("adelaide64d3.cnp75.recouv", site.getHost());
        assertEquals("adel", site.getUsername());
        assertEquals("m02passadl", site.getPassword());
        assertEquals("CNP-31", site.getRessourceDelestage());
        assertEquals("00T", site.getOrganismeMassification());

    }

    @Test
    void test_update_site_cnp() throws IOException {

        final var variables = createSiteCNPInput("CIRTIL",
                "adelaide64d3.cnp75.recouv",
                "adel",
                "m02passadl",
                "CNP-31",
                "00T");

        final var response = graphQLTestTemplate.perform("graphql-requests/sites/cnp/create-sites-cnp.graphql",
                variables);

        assertNotNull(response);

        final var updateVariables = createSiteCNPInput("CIRTIL",
                "localhost",
                "adelaide",
                "passwordadl",
                "CNP-06",
                "01T");

        final var updateResponse = graphQLTestTemplate.perform("graphql-requests/sites/cnp/update-sites-cnp.graphql",
                updateVariables);

        assertNotNull(updateResponse);
        assertTrue(updateResponse.isOk());
        assertEquals("CIRTIL", updateResponse.get("$.data.updateSiteCNP.code"));
        assertEquals("localhost", updateResponse.get("$.data.updateSiteCNP.host"));
        assertEquals("adelaide", updateResponse.get("$.data.updateSiteCNP.username"));
        assertEquals("passwordadl", updateResponse.get("$.data.updateSiteCNP.password"));
        assertEquals("CNP-06", updateResponse.get("$.data.updateSiteCNP.ressourceDelestage"));
        assertEquals("01T", updateResponse.get("$.data.updateSiteCNP.organismeMassification"));

    }

    @Test
    void test_delete_site_organisme() throws IOException {

        final var variables = createSiteOrganismeInput("910", "CIRTIL", "CIRTIL");

        final var response = graphQLTestTemplate.perform("graphql-requests/sites/organisme/create-sites-organisme.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var deleteVariable = new ObjectMapper().createObjectNode();
        final var server = deleteVariable.putObject("var");
        server.put("id", "910");

        final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/sites/organisme/delete-sites-organisme.graphql",
                deleteVariable);

        assertNotNull(deleteResponse);
        assertTrue(deleteResponse.isOk());
        assertEquals("true", deleteResponse.get("$.data.deleteSiteOrganisme.ok"));

        assertFalse(siteCNPRepository.existsById("910"));

    }

    @Test
    void test_delete_site_cnp() throws IOException {

        final var variables = createSiteCNPInput("CIRCIR",
                "adelaide64d3.cnp75.recouv",
                "adel",
                "m02passadl",
                "CNP-31",
                "00T");

        final var response = graphQLTestTemplate.perform("graphql-requests/sites/cnp/create-sites-cnp.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var deleteVariable = new ObjectMapper().createObjectNode();
        final var server = deleteVariable.putObject("var");
        server.put("ids", "CIRCIR");

        final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/sites/cnp/delete-sites-cnp.graphql",
                deleteVariable);

        assertNotNull(deleteResponse);
        assertTrue(deleteResponse.isOk());
        assertEquals("true", deleteResponse.get("$.data.deleteSitesCNP.ok"));

        assertFalse(siteCNPRepository.existsById("CIRCIR"));

    }

    public ObjectNode createSiteCNPInput(final String code, final String host, final String username,
                                         final String password, final String ressourceDelestage,
                                         final String organismeMassification) {

        final var variables = new ObjectMapper().createObjectNode();
        final var server = variables.putObject("var");

        server.put("code", code);
        server.put("host", host);
        server.put("username", username);
        server.put("password", password);
        server.put("ressourceDelestage", ressourceDelestage);
        server.put("organismeMassification", organismeMassification);
        return variables;
    }

}
