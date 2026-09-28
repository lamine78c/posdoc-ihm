package fr.acoss.posdoc.domain.genapp.model;

import fr.acoss.posdoc.types.TypeRefection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OccurrenceApplication {
    private String appsta;
    private String appinf;
    private LocalDateTime dapplc;
    private LocalDateTime dappld;
    private LocalDateTime dapplt;
    private LocalDateTime dappls;
    private TypeRefection typref;
    private String sitori;
}