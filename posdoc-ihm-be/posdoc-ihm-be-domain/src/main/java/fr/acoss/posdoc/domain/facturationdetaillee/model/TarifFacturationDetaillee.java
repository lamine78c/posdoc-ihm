package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class TarifFacturationDetaillee {

    private String codeTar;

    private Integer plis;

    private Float cout;
}
