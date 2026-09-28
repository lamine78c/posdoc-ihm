 INSERT INTO genetp(
    c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
    s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
    s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
    d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus
)
VALUES
    (1, 'DEB', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'D', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, '-', null, 0),
    (2, 'FIN', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'V', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, '-', null, 0),
    (3, 'BIL', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'T', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, '-', null, 0),
    (4, 'IDT', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'S', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, '-', null, 0),
    (5, 'FAB', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'S', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 0),
    (6, 'DIS', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'S', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 0),
    (7, 'DIS', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'H', 1, null, null, '2023-02-20 17:38:13',
    '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 0),
    (8, 'DIS', 'T', '750', 'SNV2', '240523-00', 'RDEH',
    '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
    null, null, 1, 1, 'T', 1, null, null, '2023-02-20 17:38:13',
     '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 0);



INSERT INTO genlie(c60_idpere, c60_idfils)
VALUES (1, 4), (4, 5), (5, 6);

INSERT INTO genapp (c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf, b14_arefec,
d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori)
VALUES  ('T', '750', 'SNV2', '240523-00', 'S', 'appinf_value', TRUE,
'2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', TRUE, 'sitori_value');
