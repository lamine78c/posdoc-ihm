package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faq.secondary.FaqPersistence;
import fr.acoss.posdoc.domain.faqnotification.model.FaqNotification;
import fr.acoss.posdoc.domain.faqnotification.secondary.FaqNotificationPersistence;
import fr.acoss.posdoc.model.Role;
import fr.acoss.posdoc.types.FaqStatus;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.FaqMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateFaqExchangeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFaqInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FaqResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaqResolver.class);

    private static final FaqMapper MAPPER = FaqMapper.INSTANCE;

    private final FaqPersistence faqPersistence;
    private final FaqNotificationPersistence faqNotificationPersistence;

    public FaqResolver(final FaqPersistence faqPersistence,  final FaqNotificationPersistence faqNotificationPersistence) {
        this.faqPersistence = faqPersistence;
        this.faqNotificationPersistence = faqNotificationPersistence;
    }

    public List<Faq> searchAllFaq() {
        return this.faqPersistence.selectAll();
    }

    public List<Faq> searchFaqByPath(String path) {
        return this.faqPersistence.findByPath(path);
    }

    public List<Faq> searchFaqByUserId(String userId) {
        return this.faqPersistence.findByUserId(userId);
    }

    public List<Faq> updateFaq(Integer id, CreateOrUpdateFaqInputDTO faqInputDTO) {
        return this.faqPersistence.updateFaq(id, MAPPER.inputDTOToDomain(faqInputDTO));
    }

    public List<Faq> updateStatus(Integer id, String status) {
        return this.faqPersistence.updateStatus(id, FaqStatus.valueOf(status));
    }

    public List<Faq> increaseViewCount(Integer id) {
        return this.faqPersistence.increaseViewCount(id);
    }

    public List<FaqNotification> getNotification() {

        Role userProfile = ContextHolder.getContext().getProfile();
        String userId = ContextHolder.getContext().getUser();

        boolean isAdmin = (userProfile == Role.NAT_ADMINISTRATEUR) || (userProfile == Role.CNE);
        return this.faqNotificationPersistence.searchByRecipientId(userId, isAdmin);

    }

    @Historisable(form = "Administration > FAQ", action = Action.UPDATE)
    public List<Faq> createFaq(final CreateOrUpdateFaqInputDTO createDTO) {
         if (LOGGER.isDebugEnabled()) {
             LOGGER.debug("createFaq: {}", createDTO);
         }

         faqPersistence.create(MAPPER.inputDTOToDomain(createDTO));
         return faqPersistence.selectAll();
    }

    @Historisable(form = "Administration > FAQ", action = Action.DELETE)
    public DeletePayloadDTO deleteFaq(final Integer deleteId) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteFaq: {}", deleteId);
        }

        faqPersistence.delete(deleteId);

        return new DeletePayloadDTO();
    }

    @Historisable(form = "Administration > FAQ", action = Action.UPDATE)
    public Faq createFaqExchange(final CreateFaqExchangeInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createFaqExchange: {}", createDTO);
        }

        return faqPersistence.addFaqExchange(createDTO.getFaqId(), MAPPER.exchangeInputDTOToDomain(createDTO));
    }

    @Historisable(form = "Administration > FAQ", action = Action.DELETE)
    public DeletePayloadDTO deleteAllExchanges(Integer faqId) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteAllExchanges: {}", faqId);
        }

        faqPersistence.deleteAllExchanges(faqId);

        return new DeletePayloadDTO();
    }
}
