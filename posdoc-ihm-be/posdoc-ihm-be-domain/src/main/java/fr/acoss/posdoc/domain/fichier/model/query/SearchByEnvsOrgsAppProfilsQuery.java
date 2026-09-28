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
public class SearchByEnvsOrgsAppProfilsQuery {
    private List<String> codesEnv;
    private List<String> codesOrg;
    private String codeApp;
    private Boolean isProfilAdmin;
}