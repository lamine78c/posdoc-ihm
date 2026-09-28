package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ApplicationRepository;
import fr.acoss.posdoc.database.entities.ApplicationCompositeId;
import fr.acoss.posdoc.database.entities.ApplicationEntity;
import fr.acoss.posdoc.domain.application.model.CodeAppDTO;
import fr.acoss.posdoc.types.TypeRefection;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateApplicationInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteApplicationInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateApplicationPayloadDTO;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ApplicationTest extends AbstractGraphqlTest {

    @Autowired
    private ApplicationRepository clientRepository;

    @Test
    @Order(1)
    void lister_applications() throws IOException {

        graphQLTestTemplate.clearHeaders();
        final var response = graphQLTestTemplate
                .perform("graphql-requests/application/liste-application-existant.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allApplications", CreateOrUpdateApplicationPayloadDTO.class);
        assertEquals(4, res.size());

    }

    @Test
    @Order(2)
    void lister_applications_with_user_profile() throws IOException {

        graphQLTestTemplate.addHeader("user.organismes", "910,920");
        final var response = graphQLTestTemplate
                .perform("graphql-requests/application/liste-application-existant.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allApplications", CreateOrUpdateApplicationPayloadDTO.class);
        assertEquals(2, res.size());
        graphQLTestTemplate.clearHeaders();
    }

    @Test
    @Order(3)
    void lister_applications_by_env() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var envs = List.of("T");
        variables.set("codesEnv", new ObjectMapper().valueToTree(envs));
        final var response = graphQLTestTemplate.perform("graphql-requests/application/liste-application-by-env.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateApplicationPayloadDTO> applications = response.getList("$.data.getApplicationsByEnvs", CreateOrUpdateApplicationPayloadDTO.class);
        assertEquals(4, applications.size());
    }

    @Test
    @Order(4)
    void lister_code_applications() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/application/find-code-applications.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CodeAppDTO> codesApp = response.getList("$.data.findCodeApp", CodeAppDTO.class);
        assertEquals(1, codesApp.size());
        assertEquals("SNV2", codesApp.get(0).getCode());
    }

    @Test
    @Order(5)
    void lister_code_applications_by_env_org() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var orgs = List.of("910", "930");
        variables.set("codenv", new ObjectMapper().valueToTree("T"));
        variables.set("codorgs", new ObjectMapper().valueToTree(orgs));
        final var response = graphQLTestTemplate.perform("graphql-requests/application/find-code-applications-by-env-orgs.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CodeAppDTO> codesApp = response.getList("$.data.findCodeAppByEnvOrgs", CodeAppDTO.class);
        assertEquals(1, codesApp.size());
        assertEquals("SNV2", codesApp.get(0).getCode());
    }

    @Test
    @Order(6)
    void createApplication_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createApplicationInput = getCreateOrUpdateApplicationInputDTO("TEST", "Application test", "117", "T", "L", TypeRefection.ACTUELS);
        variables.set("createApplication", new ObjectMapper().valueToTree(createApplicationInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/application/create-application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<ApplicationEntity> application = clientRepository.findById(new ApplicationCompositeId("T", "117", "TEST"));
        assertTrue(application.isPresent());
    }

    @Test
    @Order(7)
    void createApplication_already_exists() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createApplicationInput = getCreateOrUpdateApplicationInputDTO("SNV2", "Application SNV2 test", "910", "T", "L", TypeRefection.ACTUELS);
        variables.set("createApplication", new ObjectMapper().valueToTree(createApplicationInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/application/create-application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        String errorMessage = response.get("$.errors[0].message");
        assertEquals("L'élément Application (SNV2) est déjà existant", errorMessage);
    }

    @Test
    @Order(8)
    void updateApplication_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateApplicationInput = getCreateOrUpdateApplicationInputDTO("SNV2", "Application snv2 modifiée", "910", "T", "L", TypeRefection.INITIAUX);
        variables.set("updateApplication", new ObjectMapper().valueToTree(updateApplicationInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/application/update-application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<ApplicationEntity> application = clientRepository.findById(new ApplicationCompositeId("T", "910", "SNV2"));
        assertTrue(application.isPresent());
        assertEquals("Application snv2 modifiée", application.get().getLibelle());
        assertEquals("I", application.get().getTypeRefection().getShortValue());
    }

    @Test
    @Order(9)
    void deleteApplications_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var deleteApplicationsInput = List.of(
                new DeleteApplicationInputDTO("T", "910", "SNV2"),
                new DeleteApplicationInputDTO("T", "920", "SNV2")
        );
        variables.set("ids", new ObjectMapper().valueToTree(deleteApplicationsInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/application/delete-applications.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.deleteApplications.ok", Boolean.class));

        Optional<ApplicationEntity> application = clientRepository.findById(new ApplicationCompositeId("T", "910", "SNV2"));
        assertTrue(application.isEmpty());
        application = clientRepository.findById(new ApplicationCompositeId("T", "930", "SNV2"));
        assertTrue(application.isPresent());
    }

    private CreateOrUpdateApplicationInputDTO getCreateOrUpdateApplicationInputDTO(String code, String libelle, String codorg, String codenv, String codsys, TypeRefection typref) {
        final var createApplicationInput = new CreateOrUpdateApplicationInputDTO();
        createApplicationInput.setCode(code);
        createApplicationInput.setLibelle(libelle);
        createApplicationInput.setCodeOrganisation(codorg);
        createApplicationInput.setCodeEnvironnement(codenv);
        createApplicationInput.setCodeSystem(codsys);
        createApplicationInput.setCodeGroupe(null);
        createApplicationInput.setLotNumber(null);
        createApplicationInput.setTypeRefection(typref);
        return createApplicationInput;
    }
}
