package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class HistoryDTO {

    private Integer id;

    private String station;

    private String utilisateur;

    private LocalDateTime insertionDate;

    private String actionUtilisateur;

    private String entite;

    private String condition;

    private String entree;

    private String sortie;
}
