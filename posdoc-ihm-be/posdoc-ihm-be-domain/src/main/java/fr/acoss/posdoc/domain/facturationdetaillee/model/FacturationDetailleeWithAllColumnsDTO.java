package fr.acoss.posdoc.domain.facturationdetaillee.model;

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
public class FacturationDetailleeWithAllColumnsDTO {
    private List<FacturationDetailleeWithAllColumns> facturationDetailleeWithAllColumns;
    private String message;
}
