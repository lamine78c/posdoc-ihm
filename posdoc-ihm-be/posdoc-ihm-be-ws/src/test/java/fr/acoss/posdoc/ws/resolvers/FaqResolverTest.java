package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.FaqExchangeRepository;
import fr.acoss.posdoc.database.dao.FaqRepository;
import fr.acoss.posdoc.database.entities.FaqEntity;
import fr.acoss.posdoc.database.entities.FaqExchangeEntity;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faqnotification.model.FaqNotification;
import fr.acoss.posdoc.types.FaqStatus;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateFaqExchangeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFaqInputDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Sql(scripts = {"/sql/faq/insert-faq.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"/sql/faq/clean-faq.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class FaqResolverTest extends AbstractGraphqlTest {

    @Autowired
    private FaqRepository faqRepository;

    @Autowired
    private FaqExchangeRepository faqExchangeRepository;

    @Test
    void test_searchAll() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/faq/search-all-faq.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> allFaq = response.getList("$.data.searchAllFaq", Faq.class);
        assertEquals(2, allFaq.size());
        assertEquals(7, allFaq.get(0).getViewCount());
        assertEquals(2, allFaq.get(0).getExchanges().size());
        assertEquals(4, allFaq.get(1).getViewCount());
        assertEquals(1, allFaq.get(1).getExchanges().size());
    }

    @Test
    void test_searchByPath() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("path", new ObjectMapper().valueToTree("/admin/habilitation"));
        final var response = graphQLTestTemplate.perform("graphql-requests/faq/search-faq-by-path.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.searchFaqByPath", Faq.class);
        assertEquals(1, faqList.size());
        assertEquals("/admin/habilitation", faqList.get(0).getPath());
        assertEquals(2, faqList.get(0).getExchanges().size());
    }

    @Test
    void test_searchByUserId() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("userId", new ObjectMapper().valueToTree("AC75092074"));
        final var response = graphQLTestTemplate.perform("graphql-requests/faq/search-faq-by-user-id.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.searchFaqByUserId", Faq.class);
        assertEquals(1, faqList.size());
        assertEquals("AC75092074", faqList.get(0).getCreatedBy());
        assertEquals(FaqStatus.DRAFT, faqList.get(0).getStatus());
    }

    @Test
    void test_answerQuestion() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree(1));
        variables.set("faq", new ObjectMapper().valueToTree(new CreateOrUpdateFaqInputDTO("/admin/habilitation", "Comment ça marche ?", "Test answer")));
        final var response = graphQLTestTemplate.perform("graphql-requests/faq/update-faq.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.updateFaq", Faq.class);
        assertEquals(2, faqList.size());
        assertEquals("Test answer", faqList.get(0).getAnswer());
        assertEquals("UNKNOWN", faqList.get(0).getUpdatedBy());

        Optional<FaqExchangeEntity> exchange1 = faqExchangeRepository.findById(1);
        assertTrue(exchange1.isEmpty());
        Optional<FaqExchangeEntity> exchange2 = faqExchangeRepository.findById(2);
        assertTrue(exchange2.isEmpty());
    }

    @Test
    void test_categorizeQuestion() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree(2));
        variables.set("faq", new ObjectMapper().valueToTree(new CreateOrUpdateFaqInputDTO("/suivi/production#occurrences d''application", "A quoi ça sert ?", "")));
        final var response = graphQLTestTemplate.perform("graphql-requests/faq/update-faq.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.updateFaq", Faq.class);
        assertEquals(2, faqList.size());
        assertEquals("/suivi/production#occurrences d''application", faqList.get(1).getPath());
        assertEquals("UNKNOWN", faqList.get(1).getUpdatedBy());

        Optional<FaqExchangeEntity> exchange3 = faqExchangeRepository.findById(3);
        assertTrue(exchange3.isEmpty());
    }

    @Test
    void test_updateQuestion() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree(1));
        variables.set("faq", new ObjectMapper().valueToTree(new CreateOrUpdateFaqInputDTO("/admin/habilitation", "Pourquoi ?", "")));
        final var response = graphQLTestTemplate.perform("graphql-requests/faq/update-faq.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.updateFaq", Faq.class);
        assertEquals(2, faqList.size());
        assertEquals("Pourquoi ?", faqList.get(0).getQuestion());
        assertEquals("UNKNOWN", faqList.get(0).getUpdatedBy());

        Optional<FaqExchangeEntity> exchange1 = faqExchangeRepository.findById(1);
        assertTrue(exchange1.isEmpty());
        Optional<FaqExchangeEntity> exchange2 = faqExchangeRepository.findById(2);
        assertTrue(exchange2.isEmpty());
    }

    @Test
    void test_updateStatus() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree(2));
        variables.set("status", new ObjectMapper().valueToTree("ENABLED"));
        var response = graphQLTestTemplate.perform("graphql-requests/faq/update-status.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.updateStatus", Faq.class);
        assertEquals(2, faqList.size());
        assertEquals(FaqStatus.ENABLED, faqList.get(1).getStatus());
        assertEquals("UNKNOWN", faqList.get(1).getUpdatedBy());

        variables.set("status", new ObjectMapper().valueToTree("DISABLED"));
        response = graphQLTestTemplate.perform("graphql-requests/faq/update-status.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        faqList = response.getList("$.data.updateStatus", Faq.class);
        assertEquals(FaqStatus.DISABLED, faqList.get(1).getStatus());
        assertEquals("UNKNOWN", faqList.get(1).getUpdatedBy());
    }

    @Test
    void test_increaseViewCount() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree(1));
        var response = graphQLTestTemplate.perform("graphql-requests/faq/increase-view-count.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<Faq> faqList = response.getList("$.data.increaseViewCount", Faq.class);
        assertEquals(2, faqList.size());
        assertEquals(8, faqList.get(0).getViewCount());
    }

    @Test
    void create_faq_with_answer_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createFaqInput = new CreateOrUpdateFaqInputDTO("/admin/moteur-adelaide", "A quoi ça sert ?", "Je ne comprend pas");
        variables.set("createFaq", new ObjectMapper().valueToTree(createFaqInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/faq/create-faq.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<FaqEntity> createdFaq = faqRepository.findById(3);
        assertTrue(createdFaq.isPresent());
        assertEquals(FaqStatus.DISABLED, createdFaq.get().getStatus());
        assertNotNull(createdFaq.get().getCreatedAt());
        assertEquals("UNKNOWN", createdFaq.get().getCreatedBy());
        assertEquals(0, createdFaq.get().getViewCount());
    }

    @Test
    void create_faq_without_answer_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createFaqInput = new CreateOrUpdateFaqInputDTO("/admin/moteur-adelaide", "Comment ca fonctionne ?", null);
        variables.set("createFaq", new ObjectMapper().valueToTree(createFaqInput));

        final var response = graphQLTestTemplate.perform("graphql-requests/faq/create-faq.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<FaqEntity> createdFaq = faqRepository.findById(4);
        assertTrue(createdFaq.isPresent());
        assertEquals(FaqStatus.DRAFT, createdFaq.get().getStatus());
        assertNotNull(createdFaq.get().getCreatedAt());
        assertEquals("UNKNOWN", createdFaq.get().getCreatedBy());
        assertEquals(0, createdFaq.get().getViewCount());
    }

    @Test
    void delete_faq_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("id", new ObjectMapper().valueToTree(2));

        final var response = graphQLTestTemplate.perform("graphql-requests/faq/delete-faq.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteFaq.ok"));

        Optional<FaqExchangeEntity> exchange = faqExchangeRepository.findById(3);
        assertTrue(exchange.isEmpty());
    }

    @Test
    void create_faq_exchange_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createFaqExchangeInput = new CreateFaqExchangeInputDTO("Nouveau message", 2);
        variables.set("createFaqExchange", new ObjectMapper().valueToTree(createFaqExchangeInput));

        final var response= graphQLTestTemplate.perform("graphql-requests/faq/create-faq-exchange.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Faq faq = response.get("$.data.createFaqExchange", Faq.class);
        assertNotNull(faq);
        assertEquals(2, faq.getExchanges().size());
        assertEquals(3, faq.getExchanges().get(0).getId());
        Optional<FaqExchangeEntity> createdFaqExchange = faqExchangeRepository.findById(4);
        assertTrue(createdFaqExchange.isPresent());
        assertNotNull(createdFaqExchange.get().getFaq());
        assertEquals(2, createdFaqExchange.get().getFaq().getId());
    }

    @Test
    void delete_all_exchanges_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("faqId", new ObjectMapper().valueToTree(1));

        final var response = graphQLTestTemplate.perform("graphql-requests/faq/delete-all-exchanges.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Optional<FaqEntity> updatedFaq = faqRepository.findById(1);
        assertTrue(updatedFaq.isPresent());
        assertEquals(0, updatedFaq.get().getExchanges().size());
    }

    @Test
    void get_notification_when_admin_ok() throws IOException {
        graphQLTestTemplate.addHeader("user.login", "AC75092075");
        graphQLTestTemplate.addHeader("profile", "NAT_ADMINISTRATEUR");

        final var response = graphQLTestTemplate.postForResource("graphql-requests/faq/get-notification.graphql");
        graphQLTestTemplate.clearHeaders();

        assertNotNull(response);
        assertTrue(response.isOk());

        List<FaqNotification> data = response.getList("$.data.getNotification", FaqNotification.class);
        assertEquals(1, data.size());
    }

    @Test
    void get_notification_when_basic_user_ok() throws IOException {
        graphQLTestTemplate.addHeader("user.login", "AC75092074");
        graphQLTestTemplate.addHeader("profile", "CONSULTATION");

        final var response = graphQLTestTemplate.postForResource("graphql-requests/faq/get-notification.graphql");
        graphQLTestTemplate.clearHeaders();

        assertNotNull(response);
        assertTrue(response.isOk());

        List<FaqNotification> data = response.getList("$.data.getNotification", FaqNotification.class);
        assertEquals(1, data.size());
    }
}
