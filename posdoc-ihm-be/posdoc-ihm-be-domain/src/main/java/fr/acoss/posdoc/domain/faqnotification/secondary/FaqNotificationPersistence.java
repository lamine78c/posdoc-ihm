package fr.acoss.posdoc.domain.faqnotification.secondary;


import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faqnotification.model.FaqNotification;

import java.util.List;

public interface FaqNotificationPersistence {
    List<FaqNotification> searchByRecipientId(String userId, boolean isAdmin);

    void deleteByFaq(Integer id);

    FaqNotification create(Faq faq);
}
