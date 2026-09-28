INSERT INTO tarifs (C44_Typtar, C44_Numtar, D44_Dtarid, D44_Dtarif, N44_Coupli, B44_Optar1, B44_Optar2, B44_Optar3, B44_Urgent)
VALUES ('CD', '0001', '2014-01-01', null, 583, 0, 1, 0, 0);

INSERT INTO Params (C32_Codpar, S32_Valpar, S32_Libpar)
VALUES ('ETPMAS', '1', 'GESTION DES ÉTAPES DE MASSIFICATION ET MSP'),
    ('REMIS1', '1', 'Libelle'),
    ('REMIS2', '1', 'Libelle'),
    ('REMIS3', '1', 'Libelle');

INSERT INTO fichie(c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor,
                   s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech,
                   s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre,
                   b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig,
                   s07_codcli, s07_coddoc, b07_eclate)
VALUES ('T', '750', 'SNV2', 'RDEH', 'L02', 'TEST MASSI', 'B', 'I', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', null, null, 0);

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
        null, null, '2024-07-23 14:50:15', 1, null, null, 'R', 20118, 18954, 4, 'UCN', null, null, null, '2024-12-23 14:50:15', null, null, 'CIRTIL', 0),
       ('P', '117', 'SNV2', '241224-A0', 'AD04', '00', 'L00', 'T', '000', 0, '2024-12-24 10:08:55', '2024-12-24 10:08:55', '2024-12-24 10:08:55', null,
        null, 0, 'FICHIER ADELAIDE DES COMPTES PAPIER NON DEMATERIALISES', 'B', 'I', '-', null, 'QDI9A09', null, null, null, null, 1, 'AGESSA', null, 5, 0, 0, 0, 0, 0,
        '2024-12-25', 'QDI9A', '2024-12-24 12:00:00', 1, null, null, 'R', 33, 44, 0, 'UR117', 'DD', null, '24-000001', '2024-12-24 12:00:00', 'cool cool', 0, 'CIRTIL', 0);

INSERT INTO public.gennot (c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot, n28_poinot)
VALUES ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU1', 1),
       ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU2', 2),
       ('P', '117', 'SNV2', '241224-A0', 'AD04', '00', 'L00', ' CESU', 0),
       ('P', '117', 'SNV2', '241224-A0', 'AD04', '00', 'L00', 'CES ENVALLIA', 50);

INSERT INTO public.notice (c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES ('CESU1', 'libelle1', 'ED1', 1, 'L', '2024-05-23', 0, 'CIRTIL'),
       ('CESU2', 'libelle2', 'ED2', 2, 'L', '2024-05-23', 0, 'CIRTIL'),
       ('CES ENVALLIA', 'ENVELOPPE DEPART', 'ED', 50, 'L', null, 0, 'INTEGR'),
       (' CESU', ' CESU', 'ED', 0, 'L', null, 0, 'INTEGR');

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

INSERT INTO organi(
	c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('117', 'URSSAF ILE DE FRANCE', null, null, null, null, 'R', '117', 'CIRTIL');

INSERT INTO tarpos(
	c43_typtar, s43_libtar, n43_ordtar, b43_tlibre, b43_compta, b43_perime)
VALUES ('DD', 'PAR DEPARTEMENT TEMPOST TARIF ECO', 20, 0, 0, 0);

INSERT INTO genetp(c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
                   s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                   s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                   d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus)
VALUES (1, 'MSP', 'T', '750', 'SNV2', '240523-00', 'RDEH',
        '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
        null, null, 1, 1,'S', 1, '2023-02-21 17:38:13', '2023-02-21 17:38:13', '2023-02-20 17:38:13',
        '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 1);

INSERT INTO hisfic(c22_codenv, c22_codorg, c22_codapp, c22_percod, c22_codcom, c22_numcom, c22_codfic,
                   s22_ficsta, s22_ficinf, b22_frefec, d22_dfichc, d22_dfichd, d22_dficht, d22_dfichs,
                   d22_dfichh, b22_ficvid, s22_libfic, s22_typfor, s22_typsup, s22_typmul, s22_reffor,
                   s22_refimp, s22_refsup, s22_reftri, s22_refech, s22_refecl, n22_nbrrep, s22_ficatt,
                   s22_verimp, n22_maxpag, b22_specim, b22_cbadre, b22_ediver, b22_banimp, b22_appbac,
                   d22_dfiexp, s22_codprd, d22_dappcr, n22_repexp, s22_masuti, s22_codrnd, s22_typsig,
                   n22_pagfic, n22_plific, n22_rejfic, s22_codcli, s22_typtar, n22_codpal, s22_codbon,
                   d22_drecep, s22_inform, n22_delmsp, s22_codsit, b22_eclate)
VALUES ('T', '750', 'SNV2', '241031-00', 'SAL2', '00', '0Y00', 'H', '008', 1, '2024-10-31 06:29:35', '2024-10-31 06:29:36', '2024-10-31 08:45:36', null,
        null, 0, 'PRE ABONNEMENT SALARIE', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0,
        null, null, '2024-07-23 14:50:15', 1, null, null, 'R', 20118, 18954, 4, 'UCN', null, null, null, '2024-12-23 14:50:15', null, null, 'CIRTIL', 0);

INSERT INTO histar(c46_codenv, c46_codorg, c46_codapp, c46_percod, c46_codcom, c46_numcom, c46_codfic, c46_typtar, n46_nbplis, n46_coutot)
VALUES ('T', '750', 'SNV2', '241031-00', 'SAL2', '00', '0Y00', 'RG', '1160', '4719');

INSERT INTO hismas(c33_masenv, c33_masorg, c33_masapp, c33_masper, c33_mascom, c33_masnum, c33_masfic,
                   c33_codenv, c33_codorg, c33_codapp, c33_percod, c33_codcom, c33_numcom, c33_codfic)
VALUES ('T','750','SNV2','241031-00','SAL2','00','0Y00','T','750','SNV2','241031-00','SAL2','00','0Y00');

INSERT INTO hisnot(c29_codenv, c29_codorg, c29_codapp, c29_percod, c29_codcom, c29_numcom, c29_codfic, c29_codnot, n29_poinot)
VALUES ('T', '750', 'SNV2', '241031-00', 'SAL2', '00', '0Y00', 'CESU1', 0);
