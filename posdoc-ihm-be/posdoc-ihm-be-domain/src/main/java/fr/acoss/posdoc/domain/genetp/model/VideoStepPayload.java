package fr.acoss.posdoc.domain.genetp.model;

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
public class VideoStepPayload {
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codgam;
    private Boolean reedit;
    private String etpfus;
    private String statut;
}
