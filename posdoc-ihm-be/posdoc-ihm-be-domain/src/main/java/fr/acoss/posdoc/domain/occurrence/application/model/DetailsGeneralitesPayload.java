package fr.acoss.posdoc.domain.occurrence.application.model;

import fr.acoss.posdoc.types.TypeRefection;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DetailsGeneralitesPayload {
    private String libelle;
    private Boolean arefec;
    private TypeRefection typref;
    private String appsta;
    private String appinf;
    private LocalDateTime dapplc;
    private LocalDateTime dappld;
    private LocalDateTime dapplt;
    private LocalDateTime dappls;
    private LocalDateTime dapplh;
}
