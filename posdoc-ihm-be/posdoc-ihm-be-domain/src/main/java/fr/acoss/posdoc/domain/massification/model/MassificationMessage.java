package fr.acoss.posdoc.domain.massification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class MassificationMessage {
    private String message;
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
}
