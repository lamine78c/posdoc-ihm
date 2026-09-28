INSERT INTO GENFIC(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic, s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs, d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor, s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt, s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac, d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig, n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon, d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'T', '000', 1, '2024-09-16 11:37:07', '2024-09-16 11:37:09', '2024-09-16 11:41:21', '2023-03-31 15:40:49', null, 0, 'INFORMATION PRELEVEMENT', 'B', 'S', '-', '', 'CV02A24', '', '', '', '', 1, '', '16', 99, 0, 0, 0, 1, 0, null, 'R', '2023-01-06 15:53:00', 1, null, '', '', 20118, 18954, 0, 'UCN', '', null, null, '2023-01-06 15:53:00', null, null, 'INTEGR', 0);

INSERT INTO GENMAS(c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic, c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T', '00L', 'MAS', '230220-00', 'MAS4', '00', 'M4001', 'T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A');

INSERT INTO GENPRO(c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic,
                           c16_codgam, s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                           d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'MA', 'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0);

INSERT INTO TMPMAS(c75_codenv, c75_codorg, c75_codapp, c75_percod, c75_codcom, c75_numcom, c75_codfic, s75_mascom, s75_masfic, s75_codsit, s75_libfic, s75_typsup)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'MAS4', 'M4569', 'CIRTIL', 'CES ENVALLIA - #CESU - #CIP - NAT/6077', 'S');

INSERT INTO ORGANI (C00_Codorg, S00_Liborg, S00_Adres1, S00_Adres2, S00_Adres3, S00_Adres4, S00_Typorg, S00_Codreg, S00_Codsit)
VALUES ('42C', 'CESU', NULL, NULL, NULL, NULL, 'R', '444', 'INTEGR');
