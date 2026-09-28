package fr.acoss.posdoc.domain.contenu.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContenuForAccueil {

    private String titre;

    private String message;

    private List<String> regions;
}
