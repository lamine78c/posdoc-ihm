INSERT INTO gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES ('P', '117', 'SNV2', '250321-00', 'RDEH', '00', 'L00', 'TF', 200, 1470);

INSERT INTO params(c32_codpar, s32_valpar, s32_libpar)
VALUES ('MASAPP', 'MAS', null);

-- Massification portée par l'organisme 900, dont le fichier P/117/SNV2/250321-00/RDEH/00/L00 est un constituant
INSERT INTO genmas(c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic, c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('P', '900', 'MAS', '250321-00', 'MASC', '00', 'M00', 'P', '117', 'SNV2', '250321-00', 'RDEH', '00', 'L00');

INSERT INTO tarpos(c43_typtar, s43_libtar, n43_ordtar, b43_tlibre, b43_compta, b43_perime)
VALUES ('TF', 'FRANCE ENTIERE  TEMPOST TARIF ECO ', 30, 0, 0, 0),
       ('DOM', 'POUR LES DOM  SURTAXE DE 0,02   ', 50, 0, 0, 0);

INSERT INTO genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                   s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                   d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                   s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                   s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                   d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                   n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                   d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('P', '117', 'SNV2', '250321-00', 'RDEH', '00', 'L00',
    'T', '008', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
    null, 0, 'CES ENVALLIA -  CESU - NAT 6058 - NAT 6219', 'B', 'S', '-', null,
    null, null, null, null, null, 1, null,
    null, 8, 0, 0, 0, 0, 0,
    null, null, '2024-07-23 14:50:15', 1, null, null, 'R',
    20118, 18954, 4, 'UCN', null, null, null,
    '2024-12-23 14:50:15', null, null, 'CIRTIL', 0);

INSERT INTO tarifs(c44_typtar, c44_numtar, d44_dtarid, d44_dtarif, n44_coupli, b44_optar1, b44_optar2, b44_optar3, b44_urgent)
VALUES ('TF', '0000', '2025-01-01', null, 443, 0, 0, 0, 0),
       ('DOM', '0000', '2025-01-01', null, 431, 0, 0, 0, 0);

INSERT INTO hisfic(c22_codenv, c22_codorg, c22_codapp, c22_percod, c22_codcom, c22_numcom, c22_codfic,
                    s22_ficsta, s22_ficinf, b22_frefec, d22_dfichc, d22_dfichd, d22_dficht, d22_dfichs,
                    d22_dfichh, b22_ficvid, s22_libfic, s22_typfor, s22_typsup, s22_typmul, s22_reffor,
                    s22_refimp, s22_refsup, s22_reftri, s22_refech, s22_refecl, n22_nbrrep, s22_ficatt,
                    s22_verimp, n22_maxpag, b22_specim, b22_cbadre, b22_ediver, b22_banimp, b22_appbac,
                    d22_dfiexp, s22_codprd, d22_dappcr, n22_repexp, s22_masuti, s22_codrnd, s22_typsig,
                    n22_pagfic, n22_plific, n22_rejfic, s22_codcli, s22_typtar, n22_codpal, s22_codbon,
                    d22_drecep, s22_inform, n22_delmsp, s22_codsit, b22_eclate)
VALUES ('P', '117', 'SNV2', '220321-00', 'RDEH', '00', 'L00',
   'T', '008', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
   null, 0, 'CES ENVALLIA -  CESU - NAT 6058 - NAT 6219', 'B', 'S', '-', null,
   null, null, null, null, null, 1, null,
   null, 8, 0, 0, 0, 0, 0,
   null, null, '2024-07-23 14:50:15', 1, null, null, 'R',
   20118, 18954, 4, 'UCN', null, null, null,
   '2024-12-23 14:50:15', null, null, 'CIRTIL', 0);

INSERT INTO hisapp(c21_codenv, c21_codorg, c21_codapp, c21_percod, s21_appsta, s21_appinf, b21_arefec, d21_dapplc, d21_dappld, d21_dapplt, d21_dappls, d21_dapplh, s21_typref, b21_manuel, s21_sitori)
VALUES ('P', '117', 'SNV2', '220321-00', 'H', '000', 0, '2022-10-01 04:08:36', '2022-10-01 04:08:36', '2022-10-01 04:13:53', null, '2022-10-07 15:02:35', 'A', 0, '');