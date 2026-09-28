INSERT INTO genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                    s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                    d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                    s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                    s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                    d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                    n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                    d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'T', '006', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
         null, 0, 'INFORMATION PRELEVEMENT', 'B', 'S', '-', '-', 'CV02A24', '-', null, null, null, 1, null, 16, 99, 0, 0, 0, 1, 0,
         '2023-02-02', null, '2023-01-06 15:53:00', 1, null, null, '', 20118, 18954, 0, 'UCN', null, null, '23-222222', '2024-12-23 14:50:15', '10/10/202 msp', 19, 'INTEGR', 0);

INSERT INTO gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'DOM', 11, 4719);

INSERT INTO hisfic(c22_codenv, c22_codorg, c22_codapp, c22_percod, c22_codcom, c22_numcom, c22_codfic,
                    s22_ficsta, s22_ficinf, b22_frefec, d22_dfichc, d22_dfichd, d22_dficht, d22_dfichs,
                    d22_dfichh, b22_ficvid, s22_libfic, s22_typfor, s22_typsup, s22_typmul, s22_reffor,
                    s22_refimp, s22_refsup, s22_reftri, s22_refech, s22_refecl, n22_nbrrep, s22_ficatt,
                    s22_verimp, n22_maxpag, b22_specim, b22_cbadre, b22_ediver, b22_banimp, b22_appbac,
                    d22_dfiexp, s22_codprd, d22_dappcr, n22_repexp, s22_masuti, s22_codrnd, s22_typsig,
                    n22_pagfic, n22_plific, n22_rejfic, s22_codcli, s22_typtar, n22_codpal, s22_codbon,
                    d22_drecep, s22_inform, n22_delmsp, s22_codsit, b22_eclate)
VALUES ('P', '971', 'SNV2', '240930-00', 'PCA1', '00', 'L00', 'H', '000', 0, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
         null, 0, 'NOTIFICATION COTISANT EXPEDITION CNP', 'B', 'I', '-', '-', 'CV02A24', '-', null, null, null, 0, null, 5, 0, 1, 1, 1, 1, 1,
         '2024-10-02', 'PCA1A', '2024-09-30 21:57:00', 1, null, null, 'R', 4, 4, 0, 'UR971', null, null, '23-222222', '2024-12-23 14:50:15', '10/10/202 msp', 19, 'CIRTIL', 0);

INSERT INTO histar(c46_codenv, c46_codorg, c46_codapp, c46_percod, c46_codcom, c46_numcom, c46_codfic, c46_typtar, n46_nbplis, n46_coutot)
VALUES ('P', '971', 'SNV2', '240930-00', 'PCA1', '00', 'L00', 'DOM', 4, 2640),
       ('P', '971', 'SNV2', '240930-00', 'PCA1', '00', 'L00', 'DD', 25, 365789);

INSERT INTO organi(c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('42C', 'CESU', null, null, null, null, 'R', 444, 'CIRTIL'),
       ('971', 'CGSS DE LA GUADELOUPE', null, null, null, null, 'R', 971, 'CIRTIL');

INSERT INTO tarpos(c43_typtar, s43_libtar, n43_ordtar, b43_tlibre, b43_compta, b43_perime)
VALUES ('DD', 'PAR DEPARTEMENT TEMPOST TARIF ECO', 20, 0, 0, 0),
       ('DOM', 'PAR DEPARTEMENT TEMPOST TARIF DOM', 10, 0, 0, 0);

INSERT INTO tarifs(c44_typtar, c44_numtar, d44_dtarid, d44_dtarif, n44_coupli, b44_optar1, b44_optar2, b44_optar3, b44_urgent)
VALUES ('DOM', '0000', '2023-01-01', '2023-12-31', 530, 0, 0, 0, 0),
       ('DOM', '0001', '2024-01-01', null, 555, 0, 0, 0, 0),
       ('DD', '0000', '2023-01-01', null, 428, 0, 0, 0, 0);

INSERT INTO enviro(C01_Codenv, S01_Libenv)
VALUES ('T', 'Environnement test'), ('P', 'Environnement prod');

INSERT INTO applis(c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref)
VALUES ('T', '910', 'SNV2', 'L', 'Application snv2', 'A'),
('T', '42C', 'CES', 'L', 'Application ces', 'A');

INSERT INTO genmas(c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic, c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001', 'T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A');

INSERT INTO params(c32_codpar, s32_valpar, s32_libpar)
VALUES ('MASAPP', 'MAS', null);

INSERT INTO hisapp(c21_codenv, c21_codorg, c21_codapp, c21_percod, s21_appsta, s21_appinf, b21_arefec, d21_dapplc, d21_dappld, d21_dapplt, d21_dappls, d21_dapplh, s21_typref, b21_manuel, s21_sitori)
VALUES ('P', '971', 'SNV2', '240930-00', 'H', '000', 0, '2024-10-01 04:08:36', '2024-10-01 04:08:36', '2024-10-01 04:13:53', null, '2024-10-07 15:02:35', 'A', 0, '');
