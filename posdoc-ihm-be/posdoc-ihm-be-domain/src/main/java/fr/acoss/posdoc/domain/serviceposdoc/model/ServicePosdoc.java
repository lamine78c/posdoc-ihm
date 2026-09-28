package fr.acoss.posdoc.domain.serviceposdoc.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServicePosdoc {

    private Integer id;

    private String libelle;

    private String url;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
