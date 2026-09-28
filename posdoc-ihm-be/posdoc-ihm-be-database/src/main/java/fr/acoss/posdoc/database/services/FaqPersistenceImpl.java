package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.FaqRepository;
import fr.acoss.posdoc.database.entities.FaqEntity;
import fr.acoss.posdoc.database.mappers.FaqMapper;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faq.model.FaqExchange;
import fr.acoss.posdoc.domain.faq.secondary.FaqPersistence;
import fr.acoss.posdoc.domain.faqnotification.secondary.FaqNotificationPersistence;
import fr.acoss.posdoc.types.FaqStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FaqPersistenceImpl
        extends AbstractObjectPersistence<FaqEntity, Integer, Faq>
        implements FaqPersistence {

    private static final FaqMapper MAPPER = FaqMapper.INSTANCE;

    private final FaqRepository faqRepository;
    private final FaqNotificationPersistence faqNotificationPersistence;

    FaqPersistenceImpl(FaqRepository faqRepository, FaqNotificationPersistence faqNotificationPersistence) {
        this.faqRepository = faqRepository;
        this.faqNotificationPersistence = faqNotificationPersistence;
    }

    @Override
    protected JpaSpecificationExecutor<FaqEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<FaqEntity, Integer> getRepository() {
        return faqRepository;
    }

    @Override
    protected Function<FaqEntity, Faq> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Faq, FaqEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Faq> selectAll() {
        return this.faqRepository.findAll().stream()
                .sorted(Comparator.comparingInt(FaqEntity::getViewCount).reversed())
                .map(e -> this.entityToDomainFunction().apply(e))
                .collect(Collectors.toList());
    }

    public List<Faq> findByPath(String path) {
        return this.faqRepository.findByPath(path).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Faq> findByUserId(String userId) {
        return this.faqRepository.findByUserId(userId).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Faq> updateFaq(Integer id, Faq faq) {
        boolean isAnswerNotNull = faq.getAnswer() != null && !faq.getAnswer().isEmpty();

        Context context = ContextHolder.getContext();
        Optional<FaqEntity> faqEntity = this.faqRepository.findById(id);

        if (faqEntity.isPresent()) {
            FaqEntity entity = faqEntity.get();
            entity.setQuestion(faq.getQuestion());
            entity.setAnswer(faq.getAnswer());
            entity.setPath(faq.getPath());
            entity.setUpdatedAt(LocalDateTime.now());
            entity.setUpdatedBy(context.getUser());
            entity.removeAllExchanges();

            // Si reponse pas vide et que on est en brouillon alors on passe en désactivé
            if (isAnswerNotNull && entity.getStatus().equals(FaqStatus.DRAFT)) {
                entity.setStatus(FaqStatus.DISABLED);
            }

            this.faqRepository.save(entity);

            // Dans le cas ou la réponse est pas null on supprime les notifications associées
            if (isAnswerNotNull) {
                this.faqNotificationPersistence.deleteByFaq(id);
            }
        }
        return this.selectAll();
    }

    @Override
    public List<Faq> updateStatus(Integer id, FaqStatus status) {
        Context context = ContextHolder.getContext();
        Optional<FaqEntity> faqEntity = this.faqRepository.findById(id);

        if (faqEntity.isPresent()) {
            FaqEntity entity = faqEntity.get();
            entity.setStatus(status);
            entity.setUpdatedAt(LocalDateTime.now());
            entity.setUpdatedBy(context.getUser());
            this.faqRepository.save(entity);
            this.faqNotificationPersistence.deleteByFaq(id);
        }

        return this.selectAll();
    }

    @Override
    public List<Faq> increaseViewCount(Integer id) {
        Optional<FaqEntity> faqEntity = this.faqRepository.findById(id);
        if (faqEntity.isPresent()) {
            FaqEntity entity = faqEntity.get();
            Integer currentViewCount = entity.getViewCount();
            entity.setViewCount(currentViewCount + 1);
            this.faqRepository.save(entity);
        }

        return this.selectAll();
    }

    @Override
    public Faq addFaqExchange(Integer faqId, FaqExchange exchange) {
        Context context = ContextHolder.getContext();
        exchange.setCreatedAt(LocalDateTime.now());
        exchange.setAuthor(context.getUser());

        Optional<FaqEntity> faqEntity = this.faqRepository.findById(faqId);
        if (faqEntity.isPresent()) {
            FaqEntity entity = faqEntity.get();
            entity.addExchange(MAPPER.exchangeDomainToEntity(exchange));
            Faq faqWithNewExchanges = MAPPER.entityToDomain(this.faqRepository.save(entity));
            this.faqNotificationPersistence.create(faqWithNewExchanges);
            return faqWithNewExchanges;
        }
        return null;
    }

    @Override
    public void deleteAllExchanges(Integer id) {
        Optional<FaqEntity> faqEntity = this.faqRepository.findById(id);
        faqEntity.ifPresent(entity -> {
            entity.removeAllExchanges();
            faqRepository.save(entity);
            this.faqNotificationPersistence.deleteByFaq(id);
        });
    }

    @Override
    public Faq create(Faq faq) {
        Context context = ContextHolder.getContext();

        if ( faq.getAnswer() == null || faq.getAnswer().isBlank() ) {
            faq.setStatus(FaqStatus.DRAFT);
        } else {
            faq.setStatus(FaqStatus.DISABLED);
        }

        faq.setCreatedAt(LocalDateTime.now());
        faq.setUpdatedAt(LocalDateTime.now());
        faq.setCreatedBy(context.getUser());
        faq.setUpdatedBy(context.getUser());
        Faq faqCreated = update(faq);

        this.faqNotificationPersistence.create(faqCreated);

        return faqCreated;
    }

    @Override
    public void delete(Integer id){
        this.faqRepository.deleteById(id);
        this.faqNotificationPersistence.deleteByFaq(id);
    }
}
