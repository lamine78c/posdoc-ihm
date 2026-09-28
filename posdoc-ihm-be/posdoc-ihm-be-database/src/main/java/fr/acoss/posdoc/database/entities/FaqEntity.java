package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.FaqStatusEnumType;
import fr.acoss.posdoc.types.FaqStatus;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@TypeDef(name = "pgsql_enum_faq_status", typeClass = FaqStatusEnumType.class)
@Entity
@Getter
@Setter
@Table(name = "faq")
public class FaqEntity {

    @Id
    @Column(name = "id")
    @SequenceGenerator(name = "faq_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "faq_id_seq")
    private Integer id;

    @Column(name = "path", nullable = false)
    private String path;

    @Column(name = "question", nullable = false)
    private String question;

    @Column(name = "answer")
    private String answer;

    @Type(type = "pgsql_enum_faq_status")
    @Column(name = "status", nullable = false, columnDefinition = "faq_status default 'DRAFT'")
    @Enumerated(EnumType.STRING)
    private FaqStatus status;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "faq", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<FaqExchangeEntity> exchanges;

    @OneToMany(mappedBy = "faq", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<FaqNotificationEntity> notifications;

    public void addExchange(FaqExchangeEntity exchange) {
        if (exchange == null) return;
        exchanges.add(exchange);
        exchange.setFaq(this);
    }

    public void removeAllExchanges() {
        if (exchanges != null) {
            exchanges.clear();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof FaqEntity)) return false;
        FaqEntity faqEntity = (FaqEntity) o;
        return Objects.equals(id, faqEntity.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @PrePersist
    public void prePersist() {
        if (viewCount == null) {
            viewCount = 0;
        }
    }
}
