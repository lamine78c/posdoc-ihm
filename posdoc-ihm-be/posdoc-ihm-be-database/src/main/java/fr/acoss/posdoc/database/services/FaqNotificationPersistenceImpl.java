package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.FaqNotificationRepository;
import fr.acoss.posdoc.database.entities.FaqEntity;
import fr.acoss.posdoc.database.entities.FaqNotificationEntity;
import fr.acoss.posdoc.database.mappers.FaqNotificationMapper;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faqnotification.model.FaqNotification;
import fr.acoss.posdoc.domain.faqnotification.secondary.FaqNotificationPersistence;
import fr.acoss.posdoc.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FaqNotificationPersistenceImpl extends AbstractObjectPersistence<FaqNotificationEntity, Integer, FaqNotification> implements FaqNotificationPersistence {

    private static final FaqNotificationMapper MAPPER = FaqNotificationMapper.INSTANCE;
    private final FaqNotificationRepository faqNotificationRepository;
    @PersistenceContext
    private EntityManager entityManager;

    FaqNotificationPersistenceImpl(FaqNotificationRepository faqNotificationRepository) {
        this.faqNotificationRepository = faqNotificationRepository;
    }

    @Override
    protected JpaSpecificationExecutor<FaqNotificationEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<FaqNotificationEntity, Integer> getRepository() {
        return faqNotificationRepository;
    }

    @Override
    protected Function<FaqNotificationEntity, FaqNotification> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<FaqNotification, FaqNotificationEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<FaqNotification> searchByRecipientId(String userId, boolean isAdmin) {
        return this.faqNotificationRepository.findAllForUser(userId, isAdmin)
                .stream()
                .filter(notification -> {
                    if (notification.getRecipientId() == null) {
                        return notification.getFaq() != null
                                && !userId.equals(notification.getFaq().getCreatedBy());
                    }
                    return true;
                })
                .map(MAPPER::entityToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByFaq(Integer id) {
        this.faqNotificationRepository.deleteByFaqId(id);
    }

    @Override
    public FaqNotification create(Faq faq) {
        Context context = ContextHolder.getContext();

        // Suppression des anciennes notifs
        if (!this.faqNotificationRepository.searchByFaqId(faq.getId()).isEmpty()) {
            this.faqNotificationRepository.deleteByFaqId(faq.getId());
        }

        String recipientId = null;
        Role profile = context.getProfile();
        boolean isAdmin = (profile == Role.NAT_ADMINISTRATEUR) || (profile == Role.CNE);
        boolean isNotAuthor = !context.getUser().equals(faq.getCreatedBy());

        if (isAdmin && isNotAuthor) {
            recipientId = faq.getCreatedBy();
        }

        FaqNotificationEntity entity = new FaqNotificationEntity();
        entity.setRecipientId(recipientId);
        entity.setCreatedAt(LocalDateTime.now());

        entity.setFaq(entityManager.getReference(FaqEntity.class, faq.getId()));

        FaqNotificationEntity savedEntity = this.faqNotificationRepository.save(entity);
        return MAPPER.entityToDomain(savedEntity);
    }
}