package fr.acoss.posdoc.domain.history.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class History {

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
