package fr.acoss.posdoc.domain.format.model;

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
public class Format {

    private String code;

    private String libelle;

    private Boolean isNotAuthorisedToBeDeleted;

}
