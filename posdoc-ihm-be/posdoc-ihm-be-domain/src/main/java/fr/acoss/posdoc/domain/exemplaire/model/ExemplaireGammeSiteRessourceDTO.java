package fr.acoss.posdoc.domain.exemplaire.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExemplaireGammeSiteRessourceDTO {
    private String codgam;
    private String codsit;
    private String codres;
}
