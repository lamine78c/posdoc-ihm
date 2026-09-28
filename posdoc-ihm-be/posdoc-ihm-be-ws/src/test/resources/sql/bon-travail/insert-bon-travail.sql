INSERT INTO public.genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                   s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                   d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                   s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                   s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                   d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                   n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                   d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'T', '008', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
    null, 0, 'CES ENVALLIA -  CESU - NAT 6058 - NAT 6219', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0,
    null, null, '2024-07-23 14:50:15', 1, null, null, 'R', 20118, 18954, 4, 'UCN', null, null, null, null, null, null, 'CIRTIL', 0);

INSERT INTO public.gennot (c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot, n28_poinot)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU1', 1),
       ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU2', 2);

INSERT INTO public.notice (c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES ('CESU1', 'libelle1', 'ED1', 1, 'L', '2024-05-23', 0, 'CIRTIL'),
       ('CESU2', 'libelle2', 'ED2', 2, 'L', '2024-05-23', 0, 'CIRTIL');

INSERT INTO public.gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'RG', '1160', '4719');

INSERT INTO public.genmas (c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic,
                           c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T','750','SNV2','240523-00','RDEH','00','L02',
        'T','750','SNV2','240523-00','RDEH','00','L02');

INSERT INTO public.genapp (
    c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf,
    b14_arefec, d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori)
VALUES
    ('T', '750', 'SNV2', '240523-00', 'appsta_value', 'appinf_value',
     TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 0, 'sitori_value');
