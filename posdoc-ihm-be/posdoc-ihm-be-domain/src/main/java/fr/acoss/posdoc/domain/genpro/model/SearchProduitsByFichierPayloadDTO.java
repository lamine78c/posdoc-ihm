package fr.acoss.posdoc.domain.genpro.model;

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
public class SearchProduitsByFichierPayloadDTO {
    private String codgam;
    private String libgam;
    private String prosta;
    private String proinf;
    private LocalDateTime dprodd;
    private LocalDateTime dprodt;
    private LocalDateTime dprods;
    private Integer pagfic;
    private Integer plific;
    private Integer rejfic;
}
