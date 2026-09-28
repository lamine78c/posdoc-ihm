package fr.acoss.posdoc.domain.genetp.model;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VideoStepDetailsFichierPayload {
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
}
