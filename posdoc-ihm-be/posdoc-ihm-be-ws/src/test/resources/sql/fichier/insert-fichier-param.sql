INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic,
    s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor,
    s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl,
    n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim,
    b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr,
    s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES
    ('D', 'WEB', 'PNR', 'RDEH', 'L04', 'ECHEANCIER TRIMESTRIEL PRELEVE', 'B', 'I', '-', '724', 'L04', 'RSI', null, null, null, 0, 'messagetest', null, 5, 1, 1, 0, 1, 0, null, 'QD14E', 1, 'V', '', 'ACAC', 0),
    ('T', 'WEB', 'PNR', 'RDEH', 'L02', 'LISTE SURVEILLANCE DES STRUCTU', 'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', '', 'EC29', 0),
    ('D', '904', 'PNR', 'TEST', 'F01', 'Fichier à supprimer', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'QD14E', 1, 'V', '', 'AACC', 0),
    ('I', '010', 'SNV2', 'EI02', 'L01', 'LIBELLE FICHIER 1', 'B', 'I', '-', '724', 'QD14', 'RSI', null, null, null, 0, 'RECTO-SIMPLE', null, 5, 1, 1, 0, 1, 0, null, 'PRD01', 1, 'V', '', '', 0);

INSERT INTO params(c32_codpar, s32_valpar, s32_libpar)
VALUES ('DOCAPP', 'PNR', null),
       ('DOCORG', 'WEB', null);