package fr.acoss.posdoc.domain.help.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class UpdateHelpDTO {

    private int id;

    private String message;
}