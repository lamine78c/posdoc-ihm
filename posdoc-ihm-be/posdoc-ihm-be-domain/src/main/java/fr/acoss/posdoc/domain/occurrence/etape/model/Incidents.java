package fr.acoss.posdoc.domain.occurrence.etape.model;

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
public class Incidents {
    private LocalDateTime dcreat;
    private String script;
    private String mesano;
}
