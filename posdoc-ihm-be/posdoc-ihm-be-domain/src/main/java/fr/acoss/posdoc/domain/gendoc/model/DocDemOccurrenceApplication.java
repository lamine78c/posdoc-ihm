package fr.acoss.posdoc.domain.gendoc.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DocDemOccurrenceApplication {
    private String datdem;

    private Integer numdem;

    private String coddoc;

    private String refdem;

    private String typact;

    private String ddodeb;

    private String ddofin;
}
