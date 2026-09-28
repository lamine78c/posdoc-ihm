package fr.acoss.posdoc.domain.fichier.model.query;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class EnvOrgsAppComFicsQuery {
    private String codenv;
    private List<String> codorgs;
    private String codapp;
    private String codcom;
    private List<String> codfics;
}
