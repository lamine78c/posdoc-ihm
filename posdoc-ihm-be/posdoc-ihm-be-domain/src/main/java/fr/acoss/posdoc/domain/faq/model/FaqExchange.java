package fr.acoss.posdoc.domain.faq.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FaqExchange {

    private Integer id;

    private String author;

    private String message;

    private LocalDateTime createdAt;
}
