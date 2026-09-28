package fr.acoss.posdoc.service.anais.dto;

import lombok.*;

/**
 * DTO représentant un utilisateur récupéré depuis le web service Anais
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnaisUserDTO {
    private String uid;

    private String sn;

    private String givenName;

    private String mail;

    private String telephoneNumber;

    private String dateEntreeRh;

    private String dateSortieRh;

    private String persEtabLib;
}
