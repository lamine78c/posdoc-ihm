package fr.acoss.posdoc.domain.expedition.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpeditionPayloadDTO {
    private List<Expedition> expeditionList;
    private String message;
}
