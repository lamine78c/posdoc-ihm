package fr.acoss.posdoc.domain.faq.secondary;


import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faq.model.FaqExchange;
import fr.acoss.posdoc.types.FaqStatus;

import java.util.List;

public interface FaqPersistence {
    List<Faq> selectAll();

    List<Faq> findByPath(String path);

    List<Faq> findByUserId(String userId);

    Faq create(Faq faq);

    void delete(Integer id);

    List<Faq> updateFaq(Integer id, Faq faq);

    List<Faq> updateStatus(Integer id, FaqStatus status);

    List<Faq> increaseViewCount(Integer id);

    Faq addFaqExchange(Integer faqId, FaqExchange exchange);

    void deleteAllExchanges(Integer id);
}
