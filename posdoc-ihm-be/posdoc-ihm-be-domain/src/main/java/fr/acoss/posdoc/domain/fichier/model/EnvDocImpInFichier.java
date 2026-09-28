package fr.acoss.posdoc.domain.fichier.model;

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
public class EnvDocImpInFichier {
    private String codeDoc;
    private String codeEnv;
}
