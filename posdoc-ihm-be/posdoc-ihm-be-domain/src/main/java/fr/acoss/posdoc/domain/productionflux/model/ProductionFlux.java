package fr.acoss.posdoc.domain.productionflux.model;

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
public class ProductionFlux {

    private Integer id;

    private String nomArchiveRetour;

    private LocalDateTime dateProduction;

    private LocalDateTime datePoste;

    private String nomFichierRetour;

    private Integer nombrePlisFabriques;

    private Integer details;


}
