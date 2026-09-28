package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.AdresseRetourRepository;
import fr.acoss.posdoc.database.entities.AdresseRetourCompositeId;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateAdresseRetourPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@Sql(scripts = {"classpath:sql/adresse-retour/insert-adresse-retour.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/adresse-retour/clean-adresse-retour.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class AdresseRetourResolverTest extends AbstractGraphqlTest {

    @Autowired
    private AdresseRetourRepository adresseRetourRepository;

    @Test
    void create_adresses_retour_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var input = variables.putObject("var");
        final var adresses = input.putArray("adressesRetour");

        final var adresse1 = adresses.addObject();
        adresse1.put("code", "NEW001");
        adresse1.put("codeOrganisme", "750");
        adresse1.put("adresse1", "Nouvelle adresse 1");
        adresse1.put("adresse2", "Nouvelle adresse 2");
        adresse1.put("adresse3", "Nouvelle adresse 3");
        adresse1.put("adresse4", "Nouvelle adresse 4");

        final var adresse2 = adresses.addObject();
        adresse2.put("code", "NEW002");
        adresse2.put("codeOrganisme", "210");
        adresse2.put("adresse1", "Autre nouvelle adresse 1");
        adresse2.put("adresse2", "Autre nouvelle adresse 2");
        adresse2.put("adresse3", "Autre nouvelle adresse 3");
        adresse2.put("adresse4", "Autre nouvelle adresse 4");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/adresse-retour/create-adresses-retour.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("NEW001", response.get("$.data.createAdressesRetour[0].code"));
        assertEquals("750", response.get("$.data.createAdressesRetour[0].codeOrganisme"));
        assertEquals("Nouvelle adresse 1", response.get("$.data.createAdressesRetour[0].adresse1"));
        assertEquals("NEW002", response.get("$.data.createAdressesRetour[1].code"));
        assertEquals("210", response.get("$.data.createAdressesRetour[1].codeOrganisme"));

        final var adr1 = adresseRetourRepository.findById(new AdresseRetourCompositeId("NEW001", "750"));
        assertTrue(adr1.isPresent());
        assertEquals("Nouvelle adresse 1", adr1.get().getAdresse1());

        final var adr2 = adresseRetourRepository.findById(new AdresseRetourCompositeId("NEW002", "210"));
        assertTrue(adr2.isPresent());
        assertEquals("Autre nouvelle adresse 1", adr2.get().getAdresse1());
    }

    @Test
    void create_adresses_retour_already_exists() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var input = variables.putObject("var");
        final var adresses = input.putArray("adressesRetour");

        final var adresse1 = adresses.addObject();
        adresse1.put("code", "ADR001");
        adresse1.put("codeOrganisme", "750");
        adresse1.put("adresse1", "Tentative doublon");
        adresse1.put("adresse2", "Ligne 2");
        adresse1.put("adresse3", "Ligne 3");
        adresse1.put("adresse4", "Ligne 4");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/adresse-retour/create-adresses-retour.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertNotNull(response.get("$.errors[0].message"));
    }

    @Test
    void update_adresse_retour_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var adresse = variables.putObject("var");
        adresse.put("code", "ADR004");
        adresse.put("codeOrganisme", "750");
        adresse.put("adresse1", "CENTRE DE GESTION - MODIFIE");
        adresse.put("adresse2", "30 AVENUE DU GENERAL DE GAULLE");
        adresse.put("adresse3", "75020 PARIS");
        adresse.put("adresse4", "FRANCE");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/adresse-retour/update-adresse-retour.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ADR004", response.get("$.data.updateAdresseRetour.code"));
        assertEquals("750", response.get("$.data.updateAdresseRetour.codeOrganisme"));
        assertEquals("CENTRE DE GESTION - MODIFIE", response.get("$.data.updateAdresseRetour.adresse1"));
        assertEquals("30 AVENUE DU GENERAL DE GAULLE", response.get("$.data.updateAdresseRetour.adresse2"));

        final var adr = adresseRetourRepository.findById(new AdresseRetourCompositeId("ADR004", "750"));
        assertTrue(adr.isPresent());
        assertEquals("CENTRE DE GESTION - MODIFIE", adr.get().getAdresse1());
        assertEquals("30 AVENUE DU GENERAL DE GAULLE", adr.get().getAdresse2());
    }

    @Test
    void update_adresse_retour_not_found() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var adresse = variables.putObject("var");
        adresse.put("code", "NOT_EXISTS");
        adresse.put("codeOrganisme", "999");
        adresse.put("adresse1", "Ne devrait pas fonctionner");
        adresse.put("adresse2", "Ligne 2");
        adresse.put("adresse3", "Ligne 3");
        adresse.put("adresse4", "Ligne 4");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/adresse-retour/update-adresse-retour.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertNotNull(response.get("$.errors[0].message"));
    }

    @Test
    void delete_adresses_retour_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var input = variables.putObject("var");
        final var ids = input.putArray("ids");

        final var id1 = ids.addObject();
        id1.put("code", "ADR005");
        id1.put("codeOrganisme", "210");

        final var id2 = ids.addObject();
        id2.put("code", "ADR006");
        id2.put("codeOrganisme", "210");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/adresse-retour/delete-adresses-retour.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteAdressesRetour.ok"));

        final var adr1 = adresseRetourRepository.existsById(new AdresseRetourCompositeId("ADR005", "210"));
        assertFalse(adr1);

        final var adr2 = adresseRetourRepository.existsById(new AdresseRetourCompositeId("ADR006", "210"));
        assertFalse(adr2);
    }

    @Test
    void all_adresses_retour_ok() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/adresse-retour/all-adresses-retour.graphql", null);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var adresses = response.getList("$.data.allAdressesRetour", CreateOrUpdateAdresseRetourPayloadDTO.class);
        assertTrue(adresses.size() >= 6);
    }

}
