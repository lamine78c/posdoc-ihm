package fr.acoss.posdoc.domain.notice.model;

import fr.acoss.posdoc.types.NoticePornotType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NoticeOccurrenceApplication {
    private String codnot;

    private Integer poinot;

    private String fornot;

    private NoticePornotType pornot;

    private String libnot;

    private String codsit;
}
