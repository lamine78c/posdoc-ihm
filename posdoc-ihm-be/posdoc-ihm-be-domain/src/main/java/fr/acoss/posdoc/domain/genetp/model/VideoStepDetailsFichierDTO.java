package fr.acoss.posdoc.domain.genetp.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class VideoStepDetailsFichierDTO {
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private String libfic;
    private String refimp;
    private String codcli;
    private LocalDateTime dfiexp;
    private Integer pagfic;
    private Integer plific;
    private Integer rejfic;
}