package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ConsolidationFacturationWithAllColumnsDTO {
    private List<ConsolidationFacturationWithAllColumns> consolidationFacturationList;
    private String message;
}
