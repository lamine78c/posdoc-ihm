package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.OrganismeRepository;
import fr.acoss.posdoc.database.entities.OrganismeEntity;
import fr.acoss.posdoc.domain.organisme.model.CodeOrganismeDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateOrganismeInputDTO;
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

@Sql(scripts = {"classpath:sql/organisme/insert-organisme.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/organisme/clean-organisme.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OrganismeResolverTest extends AbstractGraphqlTest {

    @Autowired
    private OrganismeRepository organismeRepository;

    @Test
    void lister_organismes_by_region() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("regions", new ObjectMapper().valueToTree(List.of("CM422")));

        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/lister-organisme-by-region.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> organismes = response.getList("$.data.getCodesOrganismesByRegions", String.class);
        assertEquals(2, organismes.size());
        assertTrue(organismes.contains("010"));
        assertTrue(organismes.contains("071"));
        assertFalse(organismes.contains("300"));
    }

    @Test
    void create_organisme_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createOrganismeInput = getCreateOrUpdateOrganismeInputDTO("260", "URSSAF DE LA DROME", "R", "827", "CIRTIL");
        variables.set("createOrganisme", new ObjectMapper().valueToTree(createOrganismeInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/create-organisme.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<OrganismeEntity> createdOrganisme = organismeRepository.findById("260");
        assertTrue(createdOrganisme.isPresent());
        assertEquals("URSSAF DE LA DROME", createdOrganisme.get().getLibelle());
    }

    @Test
    void create_organisme_already_existing() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createOrganismeInput = getCreateOrUpdateOrganismeInputDTO("300", "URSSAF DE LA DROME", "R", "827", "CIRTIL");
        variables.set("createOrganisme", new ObjectMapper().valueToTree(createOrganismeInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/create-organisme.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        String errorMessage = response.get("$.errors[0].message");
        assertEquals("L'élément Organisme (300) est déjà existant", errorMessage);
    }

    @Test
    void update_organisme_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createOrganismeInput = getCreateOrUpdateOrganismeInputDTO("200", "URSSAF DE LA CORSE updated", "R", "827", "CIRTIL");
        variables.set("updateOrganisme", new ObjectMapper().valueToTree(createOrganismeInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/update-organisme.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<OrganismeEntity> updatedOrganisme = organismeRepository.findById("200");
        assertTrue(updatedOrganisme.isPresent());
        assertEquals("URSSAF DE LA CORSE updated", updatedOrganisme.get().getLibelle());
        assertEquals("R", updatedOrganisme.get().getType());
        assertEquals("827", updatedOrganisme.get().getCodeRegion());
    }

    @Test
    void update_organisme_not_exists() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createOrganismeInput = getCreateOrUpdateOrganismeInputDTO("250", "URSSAF DE LA CORSE updated", "R", "827", "CIRTIL");
        variables.set("updateOrganisme", new ObjectMapper().valueToTree(createOrganismeInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/update-organisme.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        String errorMessage = response.get("$.errors[0].message");
        assertEquals("L'élément Organisme (250) n'existe pas", errorMessage);
    }

    @Test
    void delete_organismes_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var deleteOrganismesInput = List.of("660", "071");
        variables.set("ids", new ObjectMapper().valueToTree(deleteOrganismesInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/delete-organismes.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.deleteOrganismes.ok", Boolean.class));

        Optional<OrganismeEntity> organisme = organismeRepository.findById("660");
        assertTrue(organisme.isEmpty());
        organisme = organismeRepository.findById("071");
        assertTrue(organisme.isEmpty());
        organisme = organismeRepository.findById("200");
        assertTrue(organisme.isPresent());
    }

    @Test
    void find_code_organismes_type_R() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/organisme/lister-code-organisme-type-R.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CodeOrganismeDTO> codes = response.getList("$.data.findCodeOrganismesByTypeR", CodeOrganismeDTO.class);
        assertEquals(4, codes.size());
        assertEquals("010", codes.get(0).getCode());
        assertFalse(codes.contains(new CodeOrganismeDTO("200")));
    }

    private CreateOrUpdateOrganismeInputDTO getCreateOrUpdateOrganismeInputDTO(String code, String libelle, String type, String codeRegion, String codeSite) {
        CreateOrUpdateOrganismeInputDTO input = new CreateOrUpdateOrganismeInputDTO();
        input.setCode(code);
        input.setLibelle(libelle);
        input.setType(type);
        input.setCodeRegion(codeRegion);
        input.setCodeSite(codeSite);

        return input;
    }
}
