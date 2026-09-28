-- Insertion de données pour les tests de bon de travail manuel

-- ORGANI: Organismes nécessaires pour les tests
INSERT INTO public.organi (c00_codorg, s00_liborg, s00_codsit)
VALUES ('750', 'CPAM Paris 750', 'CIRTIL');

-- GENBON: Compteur pour génération de codbon
INSERT INTO public.genbon (c80_clebon, s80_codbon)
VALUES ('COD', NULL);

-- FICHIE: Définitions de fichiers pour les bons de travail manuels
INSERT INTO public.fichie (
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul,
    s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc,
    n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp,
    s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES
    ('T', '750', 'SNV2', 'MANU', 'M01', 'BON TRAVAIL MANUEL TEST', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', 'UCN', '', 0),
    ('T', '750', 'SNV2', 'MANU', 'M02', 'BON TRAVAIL MANUEL TEST 2', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 10, 0, 0, 0, 0, 0, null, null, 1, 'R', 'UCN', '', 0),
    ('T', '750', 'CNAV', 'MANU', 'C01', 'BON TRAVAIL MANUEL CNAV', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', 'UCN', '', 0),
    ('T', '750', 'SNV2', 'NEW1', 'M03', 'BON TRAVAIL NOUVEAU 3', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', 'UCN', '', 0),
    ('T', '750', 'SNV2', 'NEW2', 'M04', 'BON TRAVAIL NOUVEAU 4', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0, null, null, 1, 'R', 'UCN', '', 0);

-- TARPOS: Type de tarif 'RG'
INSERT INTO public.tarpos (c43_typtar, s43_libtar, n43_ordtar, b43_tlibre, b43_compta, b43_perime)
VALUES ('RG', 'Tarif régulier', 3, 0, 0, 0);

-- TARIFS: Grille de tarifs pour 'RG'
INSERT INTO public.tarifs (c44_typtar, c44_numtar, d44_dtarid, d44_dtarif, n44_coupli, b44_optar1, b44_optar2, b44_optar3, b44_urgent)
VALUES
('RG', '0001', '2024-01-01', '2024-01-01', 500, 0, 0, 0, 0),
('RG', '0002', '2024-01-01', '2024-01-01', 450, 0, 0, 0, 0);

-- GENAPP: Application de bon de travail manuel
INSERT INTO public.genapp (
    c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf,
    b14_arefec, d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori)
VALUES
    ('T', '750', 'SNV2', '240523-00', 'appsta_value', 'appinf_value',
     TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 1, 'sitori_value'),
    ('T', '750', 'CNAV', '240623-00', 'appsta_value', 'appinf_value',
     TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 1, 'sitori_value');

-- GENFIC: Fichiers de bon de travail manuel
INSERT INTO public.genfic(c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                   s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                   d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                   s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                   s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                   d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                   n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                   d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate)
VALUES
    ('T', '750', 'SNV2', '240523-00', 'MANU', '01', 'M01', 'T', '008', 1, '2024-07-23 14:52:15', '2024-07-23 14:52:16', '2024-09-16 16:13:11', '2024-07-23 14:52:43',
     null, 0, 'BON TRAVAIL MANUEL TEST', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0,
     null, null, '2024-07-23 14:50:15', 1, null, null, 'R', 100, 95, 5, 'UCN', 'RG', null, null, null, null, null, 'CIRTIL', 0),
    ('T', '750', 'SNV2', '240523-00', 'MANU', '02', 'M02', 'T', '008', 1, '2024-07-24 14:52:15', '2024-07-24 14:52:16', '2024-09-16 16:13:11', '2024-07-24 14:52:43',
     null, 0, 'BON TRAVAIL MANUEL TEST 2', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 10, 0, 0, 0, 0, 0,
     null, null, '2024-07-24 14:50:15', 1, null, null, 'R', 200, 190, 10, 'UCN', 'RG', null, null, null, null, null, 'CIRTIL', 0),
    ('T', '750', 'CNAV', '240623-00', 'MANU', '01', 'C01', 'T', '008', 1, '2024-07-25 14:52:15', '2024-07-25 14:52:16', '2024-09-16 16:13:11', '2024-07-25 14:52:43',
     null, 0, 'BON TRAVAIL MANUEL CNAV', 'B', 'S', '-', null, null, null, null, null, null, 1, null, null, 8, 0, 0, 0, 0, 0,
     null, null, '2024-07-25 14:50:15', 1, null, null, 'R', 50, 48, 2, 'UCN', 'RG', null, null, null, null, null, 'CIRTIL', 0);

-- GENNOT: Notices liées aux fichiers de bon de travail manuel
INSERT INTO public.gennot (c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot, n28_poinot)
VALUES
    ('T', '750', 'SNV2', '240523-00', 'MANU', '01', 'M01', 'NOTICE1', 1),
    ('T', '750', 'SNV2', '240523-00', 'MANU', '01', 'M01', 'NOTICE2', 2),
    ('T', '750', 'SNV2', '240523-00', 'MANU', '02', 'M02', 'NOTICE3', 1),
    ('T', '750', 'CNAV', '240623-00', 'MANU', '01', 'C01', 'NOTICE1', 1);

-- NOTICE: Définition des notices
INSERT INTO public.notice (c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES
    ('NOTICE1', 'Notice de test 1', 'ED1', 1, 'L', '2024-05-23', 0, 'CIRTIL'),
    ('NOTICE2', 'Notice de test 2', 'ED2', 2, 'L', '2024-05-23', 0, 'CIRTIL'),
    ('NOTICE3', 'Notice de test 3', 'ED3', 1, 'L', '2024-05-24', 0, 'CIRTIL');

-- GENTAR: Tarifs pour les bons de travail manuel
INSERT INTO public.gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot)
VALUES
    ('T', '750', 'SNV2', '240523-00', 'MANU', '01', 'M01', 'RG', '100', '450'),
    ('T', '750', 'SNV2', '240523-00', 'MANU', '02', 'M02', 'RG', '200', '900'),
    ('T', '750', 'CNAV', '240623-00', 'MANU', '01', 'C01', 'RG', '50', '225');

-- GENMAS: Masques pour les bons de travail manuel
INSERT INTO public.genmas (c31_masenv, c31_masorg, c31_masapp, c31_masper, c31_mascom, c31_masnum, c31_masfic,
                           c31_codenv, c31_codorg, c31_codapp, c31_percod, c31_codcom, c31_numcom, c31_codfic)
VALUES
    ('T','750','SNV2','240523-00','MANU','01','M01', 'T','750','SNV2','240523-00','MANU','01','M01'),
    ('T','750','SNV2','240523-00','MANU','02','M02', 'T','750','SNV2','240523-00','MANU','02','M02'),
    ('T','750','CNAV','240623-00','MANU','01','C01', 'T','750','CNAV','240623-00','MANU','01','C01');
