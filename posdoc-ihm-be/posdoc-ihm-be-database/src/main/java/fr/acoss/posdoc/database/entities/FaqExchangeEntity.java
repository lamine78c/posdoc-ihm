package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Setter
@Table(name = "faq_exchange")
public class FaqExchangeEntity {

    @Id
    @Column(name = "id")
    @SequenceGenerator(name = "faq_exchange_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "faq_exchange_id_seq")
    private Integer id;

    @Column(name = "author")
    private String author;

    @Column(name = "message")
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "faq_id", nullable = false)
    private FaqEntity faq;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof FaqExchangeEntity)) return false;
        FaqExchangeEntity that = (FaqExchangeEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, author, message, createdAt);
    }
}
