package fr.acoss.posdoc.domain.notfic.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import javax.validation.constraints.NotEmpty;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SearchNotficQuery {
    @NotEmpty(message = "Le champ notice est obligatoire")
    private String codnot;
    private String codenv ;
    private List<String> codorg ;
    private String codapp ;
    private String codcom;
    private List<String> codfic;
    private String refimp;
}
