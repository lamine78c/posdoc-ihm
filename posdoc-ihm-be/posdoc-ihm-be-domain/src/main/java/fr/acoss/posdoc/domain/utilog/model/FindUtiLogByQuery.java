package fr.acoss.posdoc.domain.utilog.model;

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
public class FindUtiLogByQuery {
    private String dtdeb;
    private String dtfin;
    private String user;
    private String action;
    private String form;
    private Boolean result;
}
