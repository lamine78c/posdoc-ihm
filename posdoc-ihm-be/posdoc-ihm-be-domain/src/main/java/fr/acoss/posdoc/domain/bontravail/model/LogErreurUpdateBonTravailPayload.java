package fr.acoss.posdoc.domain.bontravail.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LogErreurUpdateBonTravailPayload {
    private String codenv;
    private String codorg;
    private String codapp;
    private String erreur;
    private String user;
    private String formid;
}
