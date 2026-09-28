INSERT INTO fichie(
    c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic,
    s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp,
    s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt,
    s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp,
    b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli,
    s07_coddoc, b07_eclate)
VALUES
    ('T', '901', 'AP01', 'CM01', 'F0001', 'FICHIER SANS PRODUIT',     'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', 'CLI1', 'DOC1', 0),
    ('T', '902', 'AP02', 'CM02', 'F0002', 'FICHIER 1 PRODUIT',         'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', 'CLI2', 'DOC2', 0),
    ('T', '903', 'AP03', 'CM03', 'F0003', 'FICHIER MULTI PRODUITS',    'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', 'CLI3', 'DOC3', 0),
    ('T', '904', 'AP04', 'CM04', 'F0090', 'FICHIER ORDRE 90',          'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', 'CLI4', 'DOC4', 0),
    ('T', '904', 'AP04', 'CM04', 'F0050', 'FICHIER ORDRE 50',          'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', 'CLI4', 'DOC4', 0),
    ('T', '904', 'AP04', 'CM04', 'F0010', 'FICHIER ORDRE 10',          'V', 'S', '-', '661', 'V90R', '301', null, null, null, 1, 'RECTO-SIMPLE', null, 5, 1, 0, 0, 1, 0, null, 'PC52C', 1, 'V', 'CLI4', 'DOC4', 0);

INSERT INTO produi (c09_codenv, c09_codorg, c09_codapp, c09_codcom, c09_codfic, c09_codgam, b09_proact)
VALUES ('T', '902', 'AP02', 'CM02', 'F0002', 'UP', 1);


INSERT INTO produi (c09_codenv, c09_codorg, c09_codapp, c09_codcom, c09_codfic, c09_codgam, b09_proact) VALUES
    ('T', '903', 'AP03', 'CM03', 'F0003', 'UP', 1),
    ('T', '903', 'AP03', 'CM03', 'F0003', 'RT', 1),
    ('T', '903', 'AP03', 'CM03', 'X0001', 'RT', 1),
    ('T', '903', 'AP03', 'CM03', 'X0002', 'VG', 1);
