package fr.acoss.posdoc.domain.contenu.model;

import fr.acoss.posdoc.domain.region.model.Region;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Contenu {

    private Integer id;

    private String titre;

    private LocalDateTime dateActivation;

    private LocalDateTime dateExpiration;

    private String message;

    private List<Region> regions;
}
