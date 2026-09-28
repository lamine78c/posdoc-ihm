package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.FaqNotificationRepository;
import fr.acoss.posdoc.database.dao.FaqRepository;
import fr.acoss.posdoc.database.entities.FaqEntity;
import fr.acoss.posdoc.database.mappers.FaqMapper;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faq.model.FaqExchange;
import fr.acoss.posdoc.model.Role;
import fr.acoss.posdoc.types.FaqStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/faq/insert-faq.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/faq/clean-faq.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class FaqImplTest {

    private static final FaqMapper MAPPER = FaqMapper.INSTANCE;

    @Autowired
    private FaqNotificationRepository faqNotificationRepository;
    @Autowired
    private FaqRepository faqRepository;
    @Autowired
    private FaqPersistenceImpl faqPersistence;

    @Test
    @Transactional
    void updateFaq_should_not_delete_notification_when_answer_is_empty() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_GESTIONNAIRE")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        FaqEntity faqEntity = this.faqRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("FAQ 1 non trouvée"));

        Faq faq = MAPPER.entityToDomain(faqEntity);
        faq.setAnswer("");

        this.faqPersistence.updateFaq(1, faq);

        Assertions.assertEquals(2, this.faqNotificationRepository.count());
        Assertions.assertFalse(this.faqNotificationRepository.searchByFaqId(1).isEmpty());
    }

    @Test
    @Transactional
    void updateFaq_should_delete_notification_when_answer_is_set() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_GESTIONNAIRE")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        FaqEntity faqEntity = this.faqRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("FAQ 1 non trouvée"));

        Faq faq = MAPPER.entityToDomain(faqEntity);
        faq.setAnswer("Voici une réponse");

        this.faqPersistence.updateFaq(1, faq);

        this.faqRepository.flush();
        this.faqNotificationRepository.flush();

        Assertions.assertEquals(1, this.faqNotificationRepository.count());
        Assertions.assertTrue(this.faqNotificationRepository.searchByFaqId(1).isEmpty());
    }

    @Test
    void updateStatus_should_not_delete_notification_when_faq_not_found() {
        this.faqPersistence.updateStatus(99999, FaqStatus.ENABLED);

        Assertions.assertEquals(2, this.faqNotificationRepository.count());
    }

    @Test
    @Transactional
    void updateStatus_should_delete_notification_when_faq_exists() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_GESTIONNAIRE")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        this.faqPersistence.updateStatus(2, FaqStatus.ENABLED);

        this.faqRepository.flush();
        this.faqNotificationRepository.flush();

        Assertions.assertEquals(1, this.faqNotificationRepository.count());
        Assertions.assertTrue(this.faqNotificationRepository.searchByFaqId(2).isEmpty());
    }

    @Test
    @Transactional
    void addFaqExchange_should_create_notification_when_admin_and_not_author() {
        Context context = Context.builder().user("AC75092075").profile(Role.fromString("NAT_ADMINISTRATEUR")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        FaqExchange exchange = new FaqExchange();
        exchange.setMessage("Nouvel échange");

        Assertions.assertTrue(this.faqNotificationRepository.searchByFaqId(3).isEmpty());

        this.faqPersistence.addFaqExchange(3, exchange);

        Assertions.assertEquals(3, this.faqNotificationRepository.count());
        Assertions.assertFalse(this.faqNotificationRepository.searchByFaqId(3).isEmpty());
    }

    @Test
    @Transactional
    void deleteAllExchanges_should_delete_notification_for_faq() {
        this.faqPersistence.deleteAllExchanges(1);

        Assertions.assertEquals(1, this.faqNotificationRepository.count());
        Assertions.assertTrue(this.faqNotificationRepository.searchByFaqId(1).isEmpty());
    }

    @Test
    @Transactional
    void delete_should_delete_notification_for_faq() {
        this.faqPersistence.delete(2);

        Assertions.assertEquals(1, this.faqNotificationRepository.count());
        Assertions.assertTrue(this.faqNotificationRepository.searchByFaqId(2).isEmpty());
    }
}