package fr.acoss.posdoc.domain.massification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Modèle pour les données du bilan de massification/simulation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BilanData {

    private String type;
    private List<BilanItem> items;
    private String codsit;
    private String codenv;
    private String codorg;
    private String percod;
    private String mascom;
    private String masfic;
    private String libfic;
    private String masuti;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BilanItem {
        private String codenv;
        private String codorg;
        private String codapp;
        private String percod;
        private String codcom;
        private String codfic;
        private String numcom;
        private Integer pagFic;
        private Integer pliFic;
        private String codbon;
        private String codcli;
        private String mascom;
        private String masfic;
        private String codsit;
        private String libfic;
        private String masuti;
    }
}
