package fr.acoss.posdoc.domain.exemplaire.model;

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
public class ExemplaireByFilterQuery {

    private List<String> codesEnv;

    private List<String> codesOrg;

    private List<String> codesApp;

    private List<String> codesCom;

    private List<String> codesFic;
}
