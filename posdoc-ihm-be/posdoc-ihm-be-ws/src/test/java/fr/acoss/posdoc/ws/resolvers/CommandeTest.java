package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.CommandeRepository;
import fr.acoss.posdoc.database.entities.CommandeCompositeId;
import fr.acoss.posdoc.database.entities.CommandeEntity;
import fr.acoss.posdoc.domain.commande.model.CodLibCommandeDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateCommandeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteCommandeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CommandeDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CommandeForComparePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateCommandePayloadDTO;
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

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class CommandeTest extends AbstractGraphqlTest {

    @Autowired
    private CommandeRepository commandeRepository;

    @Test
    void compare_commandes_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T").add("N");
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("100");
        ArrayNode codesApp = new ObjectMapper().createArrayNode().add("SNV2").add("TEST");
        variables.set("codesEnv", codesEnv);
        variables.set("codesOrg", codesOrg);
        variables.set("codesApp", codesApp);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/compare-commandes.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<CommandeForComparePayloadDTO> responseList = response.getList("$.data.compareCommandes", CommandeForComparePayloadDTO.class);

        assertEquals(4, responseList.size());
        assertEquals("SNV2", responseList.get(0).getApplication());
        assertEquals("100", responseList.get(0).getOrganisme());
        assertEquals("217", responseList.get(0).getCodeReg());
        assertEquals("TY25", responseList.get(0).getSortHelper());
        assertEquals("T", responseList.get(0).getEnvironnements());
    }

    @Test
    void get_distinct_envs_from_commande_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-distinct-envs-from-commandes.graphql"
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> envList = response.getList("$.data.getDistinctEnvsFromCommande", String.class);

        assertEquals(2, envList.size());
        assertEquals("N", envList.get(0));
        assertEquals("T", envList.get(1));
    }

    @Test
    void get_distinct_org_by_env_from_commande_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T");
        variables.set("codenvs", codesEnv);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-distinct-org-by-env-from-commande.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> orgList = response.getList("$.data.getDistOrgByEnvFromCommande", String.class);

        assertEquals(2, orgList.size());
        assertEquals("100", orgList.get(0));
    }

    @Test
    void get_distinct_app_by_env_org_from_commande_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("N").add("T");
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("100");
        variables.set("codenvs", codesEnv);
        variables.set("codorgs", codesOrg);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-distinct-app-by-env-org-from-commande.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> appList = response.getList("$.data.getDistAppByEnvOrgFromCommande", String.class);

        assertEquals(2, appList.size());
        assertEquals("SNV2", appList.get(0));
        assertEquals("TEST", appList.get(1));
    }

    @Test
    void get_preselected_commande_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("N").add("T");
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("100");
        final String codeApp = "SNV2";
        variables.set("codenvs", codesEnv);
        variables.set("codorgs", codesOrg);
        variables.put("codapp", codeApp);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-preselected-commande.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        CommandeDTO commandeDTO = response.get("$.data.getPreselectedCommande", CommandeDTO.class);

        assertNotNull(commandeDTO);
        assertNotNull(commandeDTO.getCommandes());
        assertEquals(3, commandeDTO.getCommandes().size());
        assertEquals("TY25", commandeDTO.getCommandes().get(0).getCode());
        assertEquals("", commandeDTO.getMessage());
    }

    @Test
    void get_preselected_commande_with_user_profile_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("N").add("T");
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("100");
        final String codeApp = "SNV2";
        variables.set("codenvs", codesEnv);
        variables.set("codorgs", codesOrg);
        variables.put("codapp", codeApp);

        graphQLTestTemplate.addHeader("user.organismes", "100");

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-preselected-commande.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateCommandePayloadDTO> comList = response.getList("$.data.getPreselectedCommande.commandes", CreateOrUpdateCommandePayloadDTO.class);

        assertEquals(1, comList.size());
        assertEquals("TY25", comList.get(0).getCode());

        graphQLTestTemplate.clearHeaders();
    }


    @Test
    void get_commandes_by_envs_org_apps_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("N").add("T");
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("750").add("100");
        final String codeApp = "SNV2";
        variables.set("codenvs", codesEnv);
        variables.set("codorgs", codesOrg);
        variables.put("codapp", codeApp);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-commandes-by-envs-org-apps.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateCommandePayloadDTO> comList = response.getList("$.data.getCommandesByEnvsOrgsApps", CreateOrUpdateCommandePayloadDTO.class);

        assertEquals(3, comList.size());
        assertEquals("TY25", comList.get(0).getCode());
    }

    @Test
    void get_distinct_org_by_envs_and_apps_from_commande_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T");
        variables.set("codenvs", codesEnv);
        ArrayNode codesApp = new ObjectMapper().createArrayNode().add("SNV2");
        variables.set("codapps", codesApp);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-distinct-org-by-envs-and-apps-from-commande.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> orgList = response.getList("$.data.getDistOrgByEnvsAndAppsFromCommande", String.class);

        assertEquals(2, orgList.size());
        assertEquals("100", orgList.get(0));
        assertEquals("750", orgList.get(1));
    }

    @Test
    void get_distinct_app_by_envs_from_commande_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T");
        variables.set("codenvs", codesEnv);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-distinct-app-by-envs-from-commande.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> orgList = response.getList("$.data.getDistAppByEnvsFromCommande", String.class);

        assertEquals(1, orgList.size());
        assertEquals("SNV2", orgList.get(0));
    }

    @Test
    void should_return_codlib_for_env_org_app() throws IOException {
        ObjectNode variables = new ObjectMapper().createObjectNode();
        ObjectNode filters = variables.putObject("filters");
        filters.put("codenv", "N");
        filters.put("codorg", "750");
        filters.put("codapp", "SNV2");

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-codlib-commande-by-env-org-app.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<CodLibCommandeDTO> result = response.getList("$.data.getCodLibCommandeByEnvOrgApp", CodLibCommandeDTO.class);

        assertFalse(result.isEmpty());
        assertNotNull(result.get(0).getCode());
        assertNotNull(result.get(0).getLibelle());
    }

    @Test
    void should_return_empty_when_no_match() throws IOException {
        ObjectNode variables = new ObjectMapper().createObjectNode();
        ObjectNode filters = variables.putObject("filters");
        filters.put("codenv", "Z");
        filters.put("codorg", "999");
        filters.put("codapp", "SNV3");

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/commande/get-codlib-commande-by-env-org-app.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<CodLibCommandeDTO> result = response.getList("$.data.getCodLibCommandeByEnvOrgApp", CodLibCommandeDTO.class);

        assertEquals(0, result.size());
    }

    @Test
    void shoud_return_all_applications_from_commandes() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/get-distinct-app-from-commande.graphql", null);
        List<String> result = response.getList("$.data.getDistinctApplications", String.class);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(2, result.size());
    }

    @Test
    void shoud_return_distinct_envs_by_app_from_commandes() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codapp", "SNV2");
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/get-distinct-envs-by-app-from-commande.graphql", variables);
        List<String> result = response.getList("$.data.getDistinctEnvsByApp", String.class);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(2, result.size());
    }

    @Test
    void shoud_return_distinct_comm_by_app_envs_from_commandes() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codapp", "SNV2");
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T").add("N");
        variables.set("codenvs", codesEnv);
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/get-distinct-comm-by-app-envs-from-commande.graphql", variables);
        List<String> result = response.getList("$.data.getDistinctCommByAppEnv", String.class);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(3, result.size());
    }

    @Test
    void shoud_return_distinct_orgs_from_commandes() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T").add("N");
        variables.set("codeEnv", codesEnv);
        variables.put("codeApp", "SNV2");
        variables.put("codeCom", "ER04");
        variables.put("codeFic", "L02");
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/get-distinct-orgs-from-commande.graphql", variables);
        List<String> result = response.getList("$.data.getDistinctOrg", String.class);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, result.size());
    }

    @Test
    void shoud_return_distinct_orgs_with_fichier_existe() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("T").add("D");
        variables.set("codeEnv", codesEnv);
        variables.put("codeApp", "SNV2");
        variables.put("codeCom", "RDEH");
        variables.put("codeFic", "L02");
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/get-distinct-orgs-from-commande.graphql", variables);
        List<String> result = response.getList("$.data.getDistinctOrg", String.class);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(0, result.size());
    }

    @Test
    void should_create_commandes() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var input = variables.putObject("createCommandes");
        final var comm = input.putArray("commandes");
        final var comm1 = comm.addObject();
        comm1.put("code", "test");
        comm1.put("codenv", "P");
        comm1.put("codorg", "111");
        comm1.put("codapp", "test");
        comm1.put("libelle", "comm test");
        final var comm2 = comm.addObject();
        comm2.put("code", "tes2");
        comm2.put("codenv", "P");
        comm2.put("codorg", "111");
        comm2.put("codapp", "tes2");
        comm2.put("libelle", "comm test2");
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/create-commandes.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        Optional<CommandeEntity> commande = commandeRepository.findById(new CommandeCompositeId("P", "111", "test", "test"));
        assertTrue(commande.isPresent());
        assertEquals("comm test", commande.get().getLibelle());
        Optional<CommandeEntity> commande2 = commandeRepository.findById(new CommandeCompositeId("P", "111", "tes2", "tes2"));
        assertTrue(commande2.isPresent());
        assertEquals("comm test2", commande2.get().getLibelle());
    }

    @Test
    void should_update_commande() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateCommandeInput = getCreateOrUpdateCommandeInputDTO("ER04", "comm test", "750", "N", "SNV2");
        variables.set("updateCommande", new ObjectMapper().valueToTree(updateCommandeInput));
        final var response = graphQLTestTemplate.perform("graphql-requests/commande/update-commande.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        Optional<CommandeEntity> commande = commandeRepository.findById(new CommandeCompositeId("N", "750", "SNV2", "ER04"));
        assertTrue(commande.isPresent());
        assertEquals("comm test", commande.get().getLibelle());
    }

    @Test
    void should_delete_commandes() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        DeleteCommandeInputDTO deleteCommandeInput = new DeleteCommandeInputDTO();
        deleteCommandeInput.setCode("ER04");
        deleteCommandeInput.setCodapp("SNV2");
        deleteCommandeInput.setCodenv("N");
        deleteCommandeInput.setCodorg("750");

        variables.set("ids", new ObjectMapper().valueToTree(deleteCommandeInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/commande/delete-commandes.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.deleteCommandes.ok", Boolean.class));

        final var commande = commandeRepository.existsById(new CommandeCompositeId("N", "750", "SNV2", "ER04"));
        assertFalse(commande);
    }

    private CreateOrUpdateCommandeInputDTO getCreateOrUpdateCommandeInputDTO(String code, String libelle, String codorg, String codenv, String codapp) {
        final var input = new CreateOrUpdateCommandeInputDTO();
        input.setCode(code);
        input.setLibelle(libelle);
        input.setCodapp(codapp);
        input.setCodenv(codenv);
        input.setCodorg(codorg);
        return input;
    }
}
