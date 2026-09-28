package fr.acoss.posdoc.domain.notice.model;

import fr.acoss.posdoc.types.NoticePornotType;
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
public class Notice {
    private String codnot;
    private String libnot;
    private String fornot;
    private BigDecimal poinot;
    private NoticePornotType pornot;
    private LocalDate dnotir;
    private Short perime;
    private String codsit;
    private String pdfFilePath;
    private Boolean isNotAuthorisedToBeDeleted;
}
