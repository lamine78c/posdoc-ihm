INSERT INTO public.genetp(	c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
                              s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                              s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                              d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus)
VALUES (1, 'BIL', 'T', '750', 'SNV2', '240523-00', 'RDEH',
        '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
        '-', '-', 0, 1,'S', 1, '2023-02-21 17:38:13', '2023-02-21 17:38:13', '2023-02-20 17:38:13',
         '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 1);
INSERT INTO public.genetp(	c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
                              s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                              s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                              d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus)
VALUES (0, 'DEB', 'T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
        '-', '-', 1, 1, 'S', 1, '2023-02-21 17:38:13', '2023-02-21 17:38:13', '2023-02-20 17:38:13',
        '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 1);
INSERT INTO public.genetp(	c59_idetap, s59_typetp, s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom,
                              s59_numcom, s59_codfic, s59_codgam, s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                              s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                              d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus)
VALUES (2, 'FIN', 'T', '750', 'SNV2', '240523-00', 'RDEH', '00', 'L02', 'FT', null, 'codres', null, null, 1, null,
        '-', '-', 1, 1, 'S', 1, '2023-02-21 17:38:13', '2023-02-21 17:38:13', '2023-02-20 17:38:13',
        '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 1);

INSERT INTO public.genlie (c60_idpere, c60_idfils)
VALUES (0, 1);

INSERT INTO public.genlie (c60_idpere, c60_idfils)
VALUES (1, 2);

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
    null, null, null, 1, null, null, 'R', 20118, 18954, 4, 'UCN', null, null, null, null, null, null, 'CIRTIL', 0);

INSERT INTO public.genapp (
    c14_codenv, c14_codorg, c14_codapp, c14_percod, s14_appsta, s14_appinf,
    b14_arefec, d14_dapplc, d14_dappld, d14_dapplt, d14_dappls, d14_dapplh, s14_typref, b14_manuel, s14_sitori)
VALUES
    ('T', '750', 'SNV2', '240523-00', 'appsta_value', 'appinf_value',
     TRUE, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'I', 0, 'sitori_value');
