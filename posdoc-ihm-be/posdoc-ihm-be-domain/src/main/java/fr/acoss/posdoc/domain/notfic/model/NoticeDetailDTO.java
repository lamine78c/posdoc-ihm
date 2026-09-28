package fr.acoss.posdoc.domain.notfic.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDetailDTO {
    private String codeNotice;
    private String format;
    private BigDecimal poids;
    private String portee;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}
