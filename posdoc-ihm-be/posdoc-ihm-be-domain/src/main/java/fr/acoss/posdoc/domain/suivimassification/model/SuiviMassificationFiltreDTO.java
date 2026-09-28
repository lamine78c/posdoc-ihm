package fr.acoss.posdoc.domain.suivimassification.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SuiviMassificationFiltreDTO {

    private String masenv;

    private String masorg;

    private String masper;

    private String codsit;

    private String appsta;

    private String dappld;

    private String dapplt;
}
