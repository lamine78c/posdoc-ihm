package fr.acoss.posdoc.domain.genfic.model;

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
public class CreateOrUpdateBonTravailManuelDTO {
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String numcom;
    private String codfic;
}
