-- Insert organi data
INSERT INTO public.organi(c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('750', 'URSSAF TEST 750', '', '', '', '', 'R', '116', 'CIRTIL'),
       ('904', 'URSSAF TEST 904', '', '', '', '', 'R', '116', 'CIRTIL');

-- Insert genfic data
INSERT INTO public.genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                          s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                          d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                          s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                          s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                          d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                          n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                          d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'T', '008', 1, '2024-07-23 14:52:15',
        '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
        null, 0, 'Fichier Test 1', 'B', 'S', '-', null, 'V90FFA', null, null, null, null, 1, null, null, 8,
        0, 0, 0, 0, 0, null, 'SNV2', '2024-07-23 14:50:15', 1, null, null, 'R', 20118, 18954, 4,
        'UCN', null, null, null, null, null, null, 'CIRTIL', 0);

INSERT INTO public.genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                          s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                          d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                          s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                          s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                          d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                          n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                          d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '01', 'L03', 'E', '009', 0, '2024-07-24 10:30:20',
        '2024-07-24 10:30:25', '2024-09-16 17:15:30', '2024-07-24 10:31:10',
        null, 1, 'Fichier Test 2', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 10,
        0, 0, 0, 0, 0, null, 'SNV2', '2024-07-24 10:28:10', 1, null, null, 'R', 15200, 14300, 3,
        'UCN', null, null, null, null, null, null, 'CIRTIL', 0);

INSERT INTO public.genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                          s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                          d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                          s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                          s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                          d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                          n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                          d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '904', 'APP1', '240623-00', 'COMM', '00', 'FIC1', 'T', '010', 1, '2024-08-01 09:00:00',
        '2024-08-01 09:00:05', '2024-09-17 10:00:00', '2024-08-01 09:01:00',
        null, 0, 'Fichier Test 3', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 5,
        0, 0, 0, 0, 0, null, 'APP1', '2024-08-01 08:58:00', 1, null, null, 'R', 12000, 11500, 2,
        'CLIENT1', null, null, null, null, null, null, 'CIRTIL', 0);