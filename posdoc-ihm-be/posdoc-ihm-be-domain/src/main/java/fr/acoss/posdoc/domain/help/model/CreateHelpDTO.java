package fr.acoss.posdoc.domain.help.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateHelpDTO {

    private String path;

    private String message;
}
