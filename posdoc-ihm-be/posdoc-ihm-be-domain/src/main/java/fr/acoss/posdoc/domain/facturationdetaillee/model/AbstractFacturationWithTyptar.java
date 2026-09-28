package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public abstract class AbstractFacturationWithTyptar {

    private String typtar;

    private String nbplis;

    private String coutot;
}
