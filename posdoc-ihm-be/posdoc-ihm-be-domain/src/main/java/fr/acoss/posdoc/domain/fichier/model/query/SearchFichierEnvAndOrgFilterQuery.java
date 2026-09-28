package fr.acoss.posdoc.domain.fichier.model.query;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SearchFichierEnvAndOrgFilterQuery {
    private String codeOrg;

    private String codeEnv;
}
