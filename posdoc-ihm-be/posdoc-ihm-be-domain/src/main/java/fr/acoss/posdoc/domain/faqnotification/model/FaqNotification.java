package fr.acoss.posdoc.domain.faqnotification.model;

import fr.acoss.posdoc.domain.faq.model.Faq;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FaqNotification {

    private Integer id;

    private String recipientId;

    private Faq faq;

    private LocalDateTime createdAt;
}
