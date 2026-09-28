package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@SuperBuilder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FacturationDetaillee extends AbstractFacturationWithTyptar {

    private String codorg;

    private String codcom;

    private String codfic;

    private String libfic;

    private Integer pagfic;

    private LocalDateTime dfiexp;

    private String codapp;

    private String codreg;

    private String codcli;

    private String codsit;
}
