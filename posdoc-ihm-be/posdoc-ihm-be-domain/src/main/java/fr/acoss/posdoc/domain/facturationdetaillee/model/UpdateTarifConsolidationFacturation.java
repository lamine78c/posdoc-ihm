package fr.acoss.posdoc.domain.facturationdetaillee.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTarifConsolidationFacturation {
    private String typtar;
    private Integer nbplis;
    private Integer coutot;
    private Boolean isCreate;
    private Boolean isUpdate;
    private Boolean isDelete;
}
