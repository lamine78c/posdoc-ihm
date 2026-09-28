package fr.acoss.posdoc.domain.premas.model;

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
public class DistinctEnvOrgAppModel {

    private String codenv;

    private String codorg;

    private String codapp;

}
