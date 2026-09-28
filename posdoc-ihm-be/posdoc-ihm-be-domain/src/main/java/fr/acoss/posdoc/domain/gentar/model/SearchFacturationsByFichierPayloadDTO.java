package fr.acoss.posdoc.domain.gentar.model;

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
public class SearchFacturationsByFichierPayloadDTO {
    private List<SearchFacturationsByFichierResult> facturations;
    private List<SearchFichiersByFichierMasResult> fichiersMas;
}
