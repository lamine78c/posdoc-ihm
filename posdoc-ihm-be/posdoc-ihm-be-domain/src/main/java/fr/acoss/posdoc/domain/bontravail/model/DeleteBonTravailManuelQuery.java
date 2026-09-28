package fr.acoss.posdoc.domain.bontravail.model;

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
public class DeleteBonTravailManuelQuery {

    private String codenv;

    private String codorg;

    private String codapp;

    private String percod;

    private String codcom;

    private String codfic;

    private String numcom;

    private String user;

    private String formId;
}
