package fr.acoss.posdoc.domain.genfic.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OccurrenceFichierPayloadDTO {
    private List<GenFic> occurrencesFichiers;
    private String message;
}
