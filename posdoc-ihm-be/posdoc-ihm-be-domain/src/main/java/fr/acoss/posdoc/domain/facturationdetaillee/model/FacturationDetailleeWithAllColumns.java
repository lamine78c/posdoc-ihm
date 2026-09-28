package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FacturationDetailleeWithAllColumns {

    private String codorg;

    private String codapp;

    private String codcom;

    private String codfic;

    private String libfic;

    private LocalDateTime dfiexp;

    private String codsit;

    private String codreg;

    private String codcli;

    private Integer totalPages;

    private Integer totalPlis;

    private Float coutTotal;

    private List<TarifFacturationDetaillee> tarifs;
}
