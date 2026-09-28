package fr.acoss.posdoc.domain.faq.model;

import fr.acoss.posdoc.types.FaqStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Faq {

    private Integer id;

    private String path;

    private String question;

    private String answer;

    private FaqStatus status;

    private Integer viewCount;

    private String createdBy;

    private String updatedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<FaqExchange> exchanges;
}
