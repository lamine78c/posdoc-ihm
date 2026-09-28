package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.FaqNotificationRepository;
import fr.acoss.posdoc.database.dao.FaqRepository;
import fr.acoss.posdoc.database.entities.FaqEntity;
import fr.acoss.posdoc.database.mappers.FaqMapper;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faqnotification.model.FaqNotification;
import fr.acoss.posdoc.model.Role;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.util.List;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/faq/insert-faq.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/faq/clean-faq.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class FaqNotificationImplTest {

    private static final FaqMapper MAPPER = FaqMapper.INSTANCE;


    @Autowired
    private FaqNotificationPersistenceImpl faqNotificationPersistence;
    @Autowired
    private FaqNotificationRepository faqNotificationRepository;
    @Autowired
    private FaqRepository faqRepository;

    @Test
    @Transactional
    void deleteByFaqId_when_notification_exist() {
        this.faqNotificationPersistence.deleteByFaq(1);

        Assertions.assertEquals(1, this.faqNotificationRepository.count());
    }

    @Test
    @Transactional
    void deleteByFaqId_when_notification_not_exist() {
        this.faqNotificationPersistence.deleteByFaq(99999);

        Assertions.assertEquals(2, this.faqNotificationRepository.count());
    }

    @Test
    @Transactional
    void create_when_creator_is_not_admin() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_GESTIONNAIRE")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        FaqEntity faqEntity = this.faqRepository.findById(3)
                .orElseThrow(() -> new EntityNotFoundException("FAQ 3 non trouvée"));

        Faq faq = MAPPER.entityToDomain(faqEntity);

        FaqNotification faqNotification = this.faqNotificationPersistence.create(faq);

        Assertions.assertEquals(3, this.faqNotificationRepository.count());
        Assertions.assertNull(faqNotification.getRecipientId());
    }

    @Test
    @Transactional
    void create_when_creator_is_admin() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_ADMINISTRATEUR")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        FaqEntity faqEntity = this.faqRepository.findById(3)
                .orElseThrow(() -> new EntityNotFoundException("FAQ 3 non trouvée"));

        Faq faq = MAPPER.entityToDomain(faqEntity);

        FaqNotification faqNotification = this.faqNotificationPersistence.create(faq);

        Assertions.assertEquals(3, this.faqNotificationRepository.count());
        Assertions.assertNull(faqNotification.getRecipientId());
    }

    @Test
    @Transactional
    void searchByRecipientId_when_researcher_is_not_admin() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_GESTIONNAIRE")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        List<FaqNotification> notifications = this.faqNotificationPersistence.searchByRecipientId(context.getUser(), false);
        Assertions.assertEquals(1, notifications.size());

        Assertions.assertEquals(2, notifications.get(0).getFaq().getId());
        Assertions.assertEquals(2, notifications.get(0).getId());
    }

    @Test
    @Transactional
    void searchByRecipientId_when_researcher_is_admin_but_not_creator_of_any_faq() {
        Context context = Context.builder().user("AC75092075").profile(Role.fromString("NAT_ADMINISTRATEUR")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        List<FaqNotification> notifications = this.faqNotificationPersistence.searchByRecipientId(context.getUser(), true);
        Assertions.assertEquals(1, notifications.size());

        Assertions.assertEquals(1, notifications.get(0).getFaq().getId());
        Assertions.assertEquals(1, notifications.get(0).getId());

    }

    @Test
    @Transactional
    void searchByRecipientId_when_researcher_is_admin_but_also_creator_of_faq() {
        Context context = Context.builder().user("AC75092074").profile(Role.fromString("NAT_ADMINISTRATEUR")).host("localhost").id(1).build();
        ContextHolder.setContext(context);

        List<FaqNotification> notifications = this.faqNotificationPersistence.searchByRecipientId(context.getUser(), true);
        Assertions.assertEquals(1, notifications.size());

        Assertions.assertEquals(2, notifications.get(0).getFaq().getId());
        Assertions.assertEquals(2, notifications.get(0).getFaq().getId());
    }
}
