package fr.acoss.posdoc.domain.utilog.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UtiLog {
    private Integer codulo;
    private String codsta;
    private String codusr;
    private String formid;
    private LocalDateTime datulo;
    private String action;
    private String params;
    private Boolean result;
    private String erreur;
    private String versio;
}
