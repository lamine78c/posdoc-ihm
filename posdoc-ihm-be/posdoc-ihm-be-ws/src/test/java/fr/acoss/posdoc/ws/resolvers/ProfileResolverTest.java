package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ProfileRepository;
import fr.acoss.posdoc.database.entities.ProfileEntity;
import fr.acoss.posdoc.types.HabilitationType;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateHabilitationInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateProfileInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateProfilePayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/profile/insert-profile.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/profile/clean-profile.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ProfileResolverTest extends AbstractGraphqlTest {

    @Autowired
    private ProfileRepository profileRepository;

    @Test
    void find_profile_by_id() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree("NAT_ADMINISTRATEUR"));
        final var response = graphQLTestTemplate.perform("graphql-requests/profile/find-profile-by-id.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateProfilePayloadDTO profile = response.get("$.data.profile", CreateOrUpdateProfilePayloadDTO.class);
        assertEquals("Administrateur national", profile.getLibelleProfile());
        assertEquals(6, profile.getHabilitations().size());
    }

    @Test
    void get_all_profiles() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/profile/list-all-profiles.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateProfilePayloadDTO> profiles = response.getList("$.data.allProfiles", CreateOrUpdateProfilePayloadDTO.class);
        assertEquals(3, profiles.size());
        assertEquals("Administrateur national", profiles.get(0).getLibelleProfile());
        assertEquals("Gestionnaire", profiles.get(1).getLibelleProfile());
        assertEquals("CNE", profiles.get(2).getLibelleProfile());
    }

    @Test
    void create_profile_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createProfileInput = getCreateOrUpdateProfileInputDTO("NAT_CONSULTATION", "Consultation nationale");
        variables.set("createProfile", new ObjectMapper().valueToTree(createProfileInput));
        final var response = graphQLTestTemplate.perform("graphql-requests/profile/create-profile.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<ProfileEntity> createdProfile = profileRepository.findById("NAT_CONSULTATION");
        assertTrue(createdProfile.isPresent());
    }

    @Test
    void create_profile_already_existing() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createProfileInput = getCreateOrUpdateProfileInputDTO("CNE", "CNE");
        variables.set("createProfile", new ObjectMapper().valueToTree(createProfileInput));
        final var response = graphQLTestTemplate.perform("graphql-requests/profile/create-profile.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        String errorMessage = response.get("$.errors[0].message");
        assertEquals("L'élément profile (CNE) est déjà existant", errorMessage);
    }

    @Test
    void update_profile_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateProfileInput = getCreateOrUpdateProfileInputDTO("CNE", "CNE updated");
        variables.set("updateProfile", new ObjectMapper().valueToTree(updateProfileInput));
        final var response = graphQLTestTemplate.perform("graphql-requests/profile/update-profile.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<ProfileEntity> updatedProfile = profileRepository.findById("CNE");
        assertTrue(updatedProfile.isPresent());
        assertEquals("CNE updated", updatedProfile.get().getLibelleProfile());
    }

    @Test
    void update_profile_not_exists() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateProfileInput = getCreateOrUpdateProfileInputDTO("NAT_CONSULTATION", "Consultation nationale");
        variables.set("updateProfile", new ObjectMapper().valueToTree(updateProfileInput));
        final var response = graphQLTestTemplate.perform("graphql-requests/profile/update-profile.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        String errorMessage = response.get("$.errors[0].message");
        assertEquals("L'élément Profile (NAT_CONSULTATION) n'existe pas", errorMessage);
    }

    @Test
    void delete_profile_is_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree("CNE"));

        final var response = graphQLTestTemplate.perform("graphql-requests/profile/delete-profile.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<ProfileEntity> deletedProfile = profileRepository.findById("CNE");
        assertTrue(deletedProfile.isEmpty());
    }

    private CreateOrUpdateProfileInputDTO getCreateOrUpdateProfileInputDTO(String profile, String libelle) {
        final var createProfileInput = new CreateOrUpdateProfileInputDTO();
        createProfileInput.setProfile(profile);
        createProfileInput.setLibelleProfile(libelle);
        createProfileInput.setHabilitations(List.of(
                new CreateOrUpdateHabilitationInputDTO(2L, null, HabilitationType.MENU, "Suivi", 2),
                new CreateOrUpdateHabilitationInputDTO(21L, 2, HabilitationType.SOUS_MENU, "Editions", 1),
                new CreateOrUpdateHabilitationInputDTO(22L, 2, HabilitationType.SOUS_MENU, "Facturation", 2)
        ));
        return createProfileInput;
    }
}
