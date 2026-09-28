DELETE FROM genmas;
DELETE FROM fichie;
DELETE FROM genfic;
DELETE FROM genpro;
DELETE FROM params;
DELETE FROM sitcnp;
DELETE FROM genapp;
DELETE FROM suppor;

INSERT INTO genmas(c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic,
                   c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001',
        'T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A'),
       ('T', '00L', 'MAS', '240829-00', 'MAS0', '00', 'M0002',
        'T', '117', 'SNV2', '230314-00', 'PD19', '00', 'L06');

INSERT INTO fichie(c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor,
                   s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech,
                   s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre,
                   b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig,
                   s07_codcli, s07_coddoc, b07_eclate)
VALUES ('T', '00L', 'MAS', 'MAS4', 'M4001', 'CES ENVALLIA -  CESU - NAT 6058 - NAT 6219', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', 'UCN', null, 0),
       ('T', '00L', 'MAS', 'MAS0', 'M0002', 'TEST MASSI', 'B', 'I', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', null, null, 0);

INSERT INTO genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                   s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                   d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                   s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                   s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                   d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                   n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                   d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001', 'T', '008', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43', null, 0, 'CES ENVALLIA -  CESU - NAT 6058 - NAT 6219', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, null, 1, null, null, 'R', 20118, 18954, 4, 'UCN', null, null, null, null, null, null, 'CIRTIL', 0),
       ('T', '00L', 'MAS', '240829-00', 'MAS0', '00', 'M0002', 'T', '008', 0, '2024-08-29 16:12:08', '2024-08-29 16:12:12', '2024-09-16 16:13:21', '2024-09-16 16:13:03', null, 0, 'TEST MASSI', 'B', 'I', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, null, 1, null, null, 'V', 0, 0, 0, null, null, null, null, null, null, null, 'CIRSO', 0),

       ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'T', '000', 1, '2024-09-16 11:37:07', '2024-09-16 11:37:09', '2024-09-16 11:41:21', '2023-03-31 15:40:49', null, 0, 'INFORMATION PRELEVEMENT', 'B', 'S', '-', null, 'CV02A24', null, null, null, null, 1, null, '16', 99, 0, 0, 0, 1, 0, null, null, '2023-01-06 15:53:00', 1, null, null, 'V', 20118, 18954, 0, 'UCN', null, null, null, '2023-01-06 15:53:00', null, null, 'INTEGR', 0),
       ('T', '117', 'SNV2', '230314-00', 'PD19', '00', 'L06', 'H', '000', 1, '2024-08-20 15:07:44', '2024-08-20 15:07:45', '2024-08-20 15:08:04', '2023-03-14 11:15:34', '2024-09-16 16:20:14', 0, 'APPEL COMPLEMENTAIRE SUITE RADIATION PAM', 'B', 'I', '-', null, 'PDPCR02', null, null, null, null, 1, null, '02', 5, 1, 0, 0, 1, 0, null, 'PDPCR', '2023-01-06 15:53:00', 1, null, null, 'R', 12, 0, 0, 'URSSAFRP', null, null, null, '2023-03-14 09:52:00', null, null, 'INTEGR', 0);

INSERT INTO genpro(c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic,
                   c16_codgam, s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                   d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic)
VALUES ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'MA', 'T', '000', 1, '2024-09-16 11:37:07', '2024-09-16 11:37:13', '2024-09-16 11:41:21', null, null, 20118, 0, 0),
       ('T', '117', 'SNV2', '230314-00', 'PD19', '00', 'L06', 'MA', 'H', '008', 0, '2023-03-14 11:14:58', '2023-03-14 11:15:02', '2023-03-14 11:15:42', '2023-03-14 11:15:34', '2024-09-16 16:20:14', 12, 0, 0);

INSERT INTO params(c32_codpar, s32_valpar, s32_libpar)
VALUES ('MASGAM', 'MA', null),
       ('MASAPP', 'MAS', null);

INSERT INTO public.sitcnp(c73_codsit, s73_hostad, s73_userid, s73_passwd, s73_resdel, s73_masorg)
	VALUES ('INTEGR', 'ADELAIDE64T3.CER69.RECOUV', 'ADEL', 'm02passadl', 'ADELDEV', '00L'),
	       ('CIRSO', 'ADELAIDE64T3.CER69.RECOUV', 'ADEL', 'm02passadl', 'ADELDEV', '00T');

INSERT INTO genapp (c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf, b14_arefec, d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori)
VALUES  ('T', '00L', 'SNV2', '230816-0G', 'appsta_value', 'appinf_value_1', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 0, 'sitori_value_1'),
        ('T', '00T', 'SNV2', '230816-0T', 'appsta_value', 'appinf_value_2', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 0, 'sitori_value_2');

INSERT INTO public.suppor(c18_typsup, s18_libsup, n18_poific)
VALUES ('S', 'STANDARDS', 50),
       ('I', 'IMPRIMES', 50);
