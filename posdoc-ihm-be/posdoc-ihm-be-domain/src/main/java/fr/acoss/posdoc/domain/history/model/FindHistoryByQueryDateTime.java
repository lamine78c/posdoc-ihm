package fr.acoss.posdoc.domain.history.model;

import fr.acoss.posdoc.types.MyslogAction;
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
public class FindHistoryByQueryDateTime {
    private LocalDateTime dtdeb;
    private LocalDateTime dtfin;
    private String user;
    private MyslogAction action;
    private String entity;
}
