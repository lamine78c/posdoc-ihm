-- Nettoyage des tables dans l'ordre des dépendances
DELETE FROM gennot;
DELETE FROM notice;
DELETE FROM gentar;
DELETE FROM genscr;
DELETE FROM genapp;
DELETE FROM premas;
DELETE FROM tmpmas;
DELETE FROM genetp;
DELETE FROM genpro;
DELETE FROM genfic;
DELETE FROM exempl;
DELETE FROM produi;
DELETE FROM ressou;
DELETE FROM fichie;
DELETE FROM comman;
DELETE FROM destin;
DELETE FROM applis;
DELETE FROM sitcnp;
DELETE FROM region;
DELETE FROM organi;
DELETE FROM enviro;

-- Environnements (4 requis pour les tests)
INSERT INTO enviro(c01_codenv, s01_libenv) VALUES
    ('D', 'Développement'),
    ('T', 'Test'),
    ('I', 'Intégration'),
    ('P', 'Production');

-- Régions
INSERT INTO region (c62_codreg, s62_libreg) VALUES
    ('116', 'REGION ILE DE FRANCE TGE'),
    ('117', 'REGION ILE DE FRANCE'),
    ('217', 'REGION CHAMPAGNE ARDENNE'),
    ('267', 'REGION BOURGOGNE');

-- Organismes
INSERT INTO organi (c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit) VALUES
    ('750', 'URSSAF ILE DE FRANCE', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('904', 'URSSAF TEST 904', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('010', 'URSSAF INTEGRATION', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('100', 'URSSAF DE L AUBE', NULL, NULL, NULL, NULL, 'R', '217', 'CIRTIL'),
    ('210', 'URSSAF DE LA COTE D OR (DIJON)', NULL, NULL, NULL, NULL, 'R', '267', ''),
    ('973', 'URSSAF TEST 973', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('00L', 'URSSAF 00L', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('42C', 'URSSAF 42C', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('910', 'URSSAF 910', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('920', 'URSSAF 920', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('930', 'URSSAF 930', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('940', 'URSSAF 940', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('117', 'URSSAF 117', NULL, NULL, NULL, NULL, 'R', '117', '');

-- Sites CNP
INSERT INTO sitcnp (c73_codsit, s73_hostad, s73_userid, s73_passwd, s73_resdel, s73_masorg) VALUES
    ('CIR', 'cnp31adelaide1', 'user1', 'pwd1', 'CNP31', '750'),
    ('CIT', 'cnp31adelaide2', 'user2', 'pwd2', 'CNP31', '904'),
    ('DEV', 'cnp31adelaide3', 'user3', 'pwd3', 'CNP31', '42C'),
    ('INT', 'cnp31adelaide4', 'user4', 'pwd4', 'CNP31', '00L'),
    ('CIRSO', 'cnp31adelaide3.cer31.recouv', 'xxxx', 'xxxx', 'CNP31', '00T'),
    ('CIRTIL', 'cnp69adelaide.cer69.recouv', 'xxxx', 'xxxx', 'CNP31', '00L');

-- Applications
INSERT INTO applis(c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref) VALUES
    ('T', '910', 'SNV2', 'L', 'Application snv2', 'A'),
    ('T', '920', 'SNV2', 'L', 'Application snv2', 'A'),
    ('T', '930', 'SNV2', 'L', 'Application snv2', 'A'),
    ('T', '940', 'SNV2', 'L', 'Application snv2', 'A');

-- Destinations
INSERT INTO destin(c10_codorg, c10_coddes, s10_libdes, s10_refpri) VALUES
    ('750', 'addre', 'adresse', 'ref adresse'),
    ('750', 'DESTI', 'destination', 'ref dest'),
    ('100', 'addre', 'adresse', 'ref adresse');

-- Commandes
INSERT INTO comman (c05_codenv, c05_codorg, c05_codapp, c05_codcom, s05_libcom) VALUES
    ('D', '904', 'SNV2', 'RDEH', 'Commande RDEH'),
    ('D', '904', 'SNV2', 'TEST', 'Commande TEST'),
    ('T', '750', 'SNV2', 'RDEH', 'Commande RDEH Test'),
    ('T', '750', 'MAS', 'RDEH', 'Commande RDEH MAS'),
    ('T', '100', 'SNV2', 'TY25', 'CORRECTION EFFECTIF PENALITE SUR PJ VLU'),
    ('T', '00L', 'MAS', 'MAS4', 'Commande MAS4'),
    ('T', '910', 'SNV2', 'RDEH', 'Commande RDEH 910'),
    ('I', '010', 'SNV2', 'EI02', 'Commande EI02'),
    ('I', '973', 'SNV2', 'AZ00', 'Commande AZ00'),
    ('P', '010', 'SNV2', 'EI02', 'Commande EI02 Prod'),
    ('P', '010', 'SNV2', 'AZ00', 'Commande AZ00 Prod'),
    ('P', '42C', 'CES', 'IPVT', 'Commande IPVT'),
    ('P', '904', 'SNV2', 'BORY', 'Commande BORY'),
    ('N', '750', 'SNV2', 'ER04', 'ECLATEMENT FICHIER CRR DE LA CPAM POUR TU35'),
    ('N', '750', 'TEST', 'TR23', 'ALIMENTATION COLLECTEUR TV80');

-- Fichiers
INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic,
    s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor,
    s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl,
    n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim,
    b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr,
    s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES
    -- Fichiers pour tests mutations et queries
    ('D', '904', 'SNV2', 'RDEH', 'L04', 'ECHEANCIER TRIMESTRIEL PRELEVE', 'B', 'I', '-', '724', 'L04', 'RSI', null, null, null, 0, 'messagetest', null, 5, 1, 1, 0, 1, 0, null, 'QD14E', 1, 'V', '', '', 0),
    ('T', '750', 'SNV2', 'RDEH', 'L02', 'LISTE SURVEILLANCE DES STRUCTU', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', '', '', 0),
    ('D', '904', 'SNV2', 'TEST', 'F01', 'Fichier à supprimer', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'QD14E', 1, 'V', '', '', 0),
    ('I', '010', 'SNV2', 'EI02', 'L01', 'LIBELLE FICHIER 1', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'PRD01', 1, 'V', '', '', 0),
    ('P', '010', 'SNV2', 'EI02', 'L02', 'LIBELLE FICHIER 2', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PRD02', 1, 'V', '', '', 0),
    ('T', '100', 'SNV2', 'TY25', 'M0001', 'LISTE TEST', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PRD03', 1, 'V', '', '', 0),
    ('T', '00L', 'MAS', 'MAS4', 'M4001', 'LISTE TEST', 'V', 'S', '-', '-', '-', '-', null, null, null, 1, 'RECTO-SIMPLE', null, 8, 0, 0, 0, 0, 0, null, 'PRD04', 1, 'V', 'UCN', '', 0),
    ('I', '973', 'SNV2', 'AZ00', 'L00', 'FICHIER L00', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'PRD05', 1, 'V', '', '', 0),
    ('P', '010', 'SNV2', 'AZ00', 'L00', 'FICHIER L00 PROD', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'PRD06', 1, 'V', '', '', 0),
    ('P', '42C', 'CES', 'IPVT', 'CV02A', 'FICHIER CV02A', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'PRD07', 1, 'V', '', '', 0),
    ('P', '904', 'SNV2', 'BORY', 'L00', 'FICHIER L00 BORY', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'PRD08', 1, 'V', '', '', 0);

-- Ressources
INSERT INTO ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
                    s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
                    s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil) VALUES
    ('T', '750', 'SNV2', 'MA', 'CIRTIL', 'MASSI', 'ADELAIDE', 'TEST - Mise Sous Pli - TEST', 'C', 'B', 'NODIST_BA',
     'NODIST_BA', '', '', '-', 0, '', '', 0, 1, null),
    ('D', '904', 'SNV2', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
     'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '100', 'TEST', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
     'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null);

-- Exemplaires
INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                    s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact) VALUES
    ('I', '010', 'SNV2', 'EI02', 'L01', 'ST', '01', 'CIRTIL', 'MASSI', '', 1, 1),
    ('P', '010', 'SNV2', 'EI02', 'L02', 'ST', '01', 'CIRTIL', 'MASSI', '', 1, 1),
    ('I', '973', 'SNV2', 'AZ00', 'L00', 'PF', '1', 'CIRTIL', 'COALA', '', 1, 1),
    ('P', '010', 'SNV2', 'AZ00', 'L00', 'PF', '1', 'CIRTIL', 'COALA', '', 1, 1),
    ('T', '750', 'SNV2', 'RDEH', 'L02', 'MA', '1', 'CIRTIL', 'MASSI', 'DESTI', 1, 1),
    ('T', '750', 'MAS', 'RDEH', 'L02', 'FT', '1', 'CIRTIL', 'MASSI', '', 1, 1),
    ('T', '750', 'SNV2', 'RDEH', 'L02', 'FT', '1', 'CIRTIL', 'MASSI', 'addre', 1, 1);

-- Production UI
INSERT INTO produi (c09_codenv, c09_codorg, c09_codapp, c09_codcom, c09_codfic, c09_codgam, b09_proact) VALUES
    ('P', '010', 'SNV2', 'EI02', 'L02', 'ST', 1),
    ('T', '117', 'SNV2', 'RDEH', 'L00', 'UP', 1);

-- Fichiers générés (genfic)
INSERT INTO genfic (c15_codenv, c15_codorg, c15_codapp, c15_percod, c15_codcom, c15_numcom, c15_codfic,
                    s15_ficsta, s15_ficinf, b15_frefec, d15_dfichc, d15_dfichd, d15_dficht, d15_dfichs,
                    d15_dfichh, b15_ficvid, s15_libfic, s15_typfor, s15_typsup, s15_typmul, s15_reffor,
                    s15_refimp, s15_refsup, s15_reftri, s15_refech, s15_refecl, n15_nbrrep, s15_ficatt,
                    s15_verimp, n15_maxpag, b15_specim, b15_cbadre, b15_ediver, b15_banimp, b15_appbac,
                    d15_dfiexp, s15_codprd, d15_dappcr, n15_repexp, s15_masuti, s15_codrnd, s15_typsig,
                    n15_pagfic, n15_plific, n15_rejfic, s15_codcli, s15_typtar, n15_codpal, s15_codbon,
                    d15_drecep, s15_inform, n15_delmsp, s15_codsit, b15_eclate) VALUES
    ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', '', '', 0,
     null, null, null, null, null, 0, '', '', '', '',
     '', '', '', '', '', '', 1, '', '', 5,
     0, 0, 0, 1, 0, null, '', null, 1, null,
     '', 'R', 0, 0, 0, '', null, null, null, null,
     null, null, 'CIRTIL', 0),
    ('T', '904', 'SNV2', '240512-10', 'BORY', '01', 'L00', '', '', 0,
     null, null, null, null, null, 0, '', '', '', '',
     '', '', '', '', '', '', 1, '', '', 5,
     0, 0, 0, 1, 0, null, '', null, 1, null,
     '', 'R', 0, 0, 0, '', null, null, null, null,
     null, null, 'CIRTIL', 0),
    ('T', '750', 'MAS', '240523-00', 'RDEH', '00', 'L02', '', '', 0,
     null, null, null, null, null, 0, '', '', '', '',
     '', '', '', '', '', '', 1, '', '', 5,
     0, 0, 0, 1, 0, null, '', null, 1, null,
     '', 'R', 0, 0, 0, '', null, null, null, null,
     null, null, 'CIRTIL', 0),
    ('T', '00L', 'MAS', '230331-00', 'MAS4', '00', 'M4001', '', '', 0,
     null, null, null, null, null, 0, '', '', '', '',
     '', '', '', '', '', '', 1, '', '', 5,
     0, 0, 0, 1, 0, null, '', null, 1, null,
     '', 'R', 0, 0, 0, '', null, null, null, null,
     null, null, 'CIRTIL', 0),
    ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', '', '', 0,
     null, null, null, null, null, 0, '', '', '', '',
     '', '', '', '', '', '', 1, '', '', 5,
     0, 0, 0, 1, 0, null, '', null, 1, null,
     '', 'R', 0, 0, 0, '', null, null, null, null,
     null, null, 'CIRTIL', 0);

-- Génération produit (genpro)
INSERT INTO genpro (c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic,
                    c16_codgam, s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                    d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic) VALUES
    ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'FT', 'H', '000', 0, '2024-05-23 20:34:36.000000',
     '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0),
    ('T', '750', 'MAS', '240523-00', 'RDEH', '00', 'L02', 'FT', 'H', '000', 0, '2024-05-23 20:34:36.000000',
     '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0),
    ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'MA', 'H', '000', 0, '2024-05-23 20:34:36.000000',
     '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0);

-- Étapes génériques (genetp)
INSERT INTO genetp(c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
                   s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                   s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                   d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus) VALUES
    (1, 'DIS', 'T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'FT', null, 'codres', 'CIRSO', null, 1, null, null, null, 1, 1,
     null, 1, null, null, null, null, null, null, null, null, 1, 1, null, null, 1);

-- TMP MAS
INSERT INTO tmpmas (c75_codenv, c75_codorg, c75_codapp, c75_percod, c75_codcom, c75_numcom, c75_codfic, s75_mascom, s75_masfic, s75_codsit, s75_libfic, s75_typsup) VALUES
    ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'MAS4', 'M4569', 'CIRTIL','CES ENVALLIA - #CESU - #CIP - NAT/6077', 'S');

-- PRE MAS
INSERT INTO premas (c84_codenv, c84_codorg, c84_codapp, c84_percod, c84_codcom, c84_numcom, c84_codfic, s84_mascom, s84_masfic, s84_codsit, s84_presta, d84_dprevc, d84_dprevt, d84_dprevi) VALUES
    ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'MAS4', 'M4569', 'CIRTIL', 'SomePresta', '2023-05-24', '2023-05-25', '2023-05-26');

-- GEN APP
INSERT INTO genapp (c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf, b14_arefec, d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori) VALUES
    ('T', '910', 'SNV2', '230816-0G', 'appsta_value', 'appinf_value', TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 0, 'sitori_value');

-- GEN SCR
INSERT INTO genscr(c41_codenv, c41_codorg, c41_codapp, c41_percod, c41_numscr, s41_signal, s41_script, s41_mesano, s41_ficinf, d41_dcreat, n41_idetap) VALUES
    ('T', '00L', 'MAS', '230331-00', '007', 'S05', 's05mm_00_mas4_m4001.sh', 'Anomalie SWEAVER /adldatas/tmp/t_00l_mas_230331-00/divers/s05mm_00_mas4_m4001.sh.026 (8)', '/adldatas/tmp/t_00l_mas_230331-00/divers/s05mm_00_mas4_m4001.sh.02616212.LOG', '2024-07-23 14:52:43', 1739);

-- NOTICE
INSERT INTO notice (c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit) VALUES
    ('CESU1', 'libelle1', 'ED1', 1, 'L', '2024-05-23', 0, 'CIRTIL'),
    ('CESU2', 'libelle2', 'ED2', 2, 'L', '2024-05-23', 0, 'CIRTIL');

-- GEN NOT
INSERT INTO gennot (c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot, n28_poinot) VALUES
    ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU1', 1),
    ('T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'CESU2', 2);

-- GEN TAR
INSERT INTO gentar(c45_codenv, c45_codorg, c45_codapp, c45_percod, c45_codcom, c45_numcom, c45_codfic, c45_typtar, n45_nbplis, n45_coutot) VALUES
    ('T', '42C', 'CES', '230106-00', 'IPVT', '00', 'CV02A', 'RG', '1160', '4719');
