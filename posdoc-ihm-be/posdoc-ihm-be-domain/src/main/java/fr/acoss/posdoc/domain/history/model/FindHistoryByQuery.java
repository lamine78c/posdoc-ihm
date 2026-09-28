package fr.acoss.posdoc.domain.history.model;

import fr.acoss.posdoc.types.MyslogAction;
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
public class FindHistoryByQuery {
    private String dtdeb;
    private String dtfin;
    private String user;
    private MyslogAction action;
    private String entity;
}
