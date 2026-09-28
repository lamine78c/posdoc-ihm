package fr.acoss.posdoc.ws.resolvers.query;

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
public class CommandeDTO {

    private String codenv;

    private String codorg;

    private String codapp;

    private String code;

    private String libelle;

}
