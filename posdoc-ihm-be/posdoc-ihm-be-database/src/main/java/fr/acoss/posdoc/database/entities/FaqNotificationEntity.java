package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "faq_notification")
public class FaqNotificationEntity {

    @Id
    @Column(name = "id")
    @SequenceGenerator(name = "faq_notification_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "faq_notification_id_seq")
    private Integer id;

    @Column(name = "recipient_id")
    private String recipientId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faq_id")
    private FaqEntity faq;
}
