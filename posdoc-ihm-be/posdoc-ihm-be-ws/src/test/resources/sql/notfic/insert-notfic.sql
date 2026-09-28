MERGE INTO Params (C32_Codpar, S32_Valpar, S32_Libpar)
KEY (C32_Codpar)
VALUES ('MASAPP', 'MAS', null);

INSERT INTO notfic(c27_codenv, c27_codorg, c27_codapp, c27_codcom, c27_codfic, c27_codnot, d27_dnotid, d27_dnotit, n27_maxnot, n27_curnot)
VALUES ('T', '780', 'SNV2', 'PD11', 'L00', 'COM 167', '2011-03-16', '2011-03-17', 0, 1),
       ('T', '780', 'SNV2', 'PD16', 'L01', 'NAT 1034 T', '2009-05-11', '2009-05-11', 0, 1),
       ('P', '010', 'SNV2', 'AD04', 'L00', '#CIP', '2024-01-01', '2024-01-02', 0, 1),
       ('P', '010', 'SNV2', 'AD04', 'L00', 'EV DBL FENET', '2024-01-01', '2024-01-02', 0, 1),
       ('P', '010', 'SNV2', 'AD04', 'L00', '%VALID', '2024-01-01', '2024-01-02', 0, 1),
       ('P', '010', 'SNV2', 'AD04', 'L01', 'EV DBL FENET', '2024-01-01', '2024-01-02', 0, 1),
       ('P', '010', 'SNV2', 'AD04', 'L01', '%VALID', '2024-01-01', '2024-01-02', 0, 1),
       ('P', '010', 'SNV2', 'ADEH', 'L00', 'EV DBL FENET', '2024-01-01', '2024-01-02', 0, 1),
       ('P', '010', 'SNV2', 'ADEH', 'L00', '%VALID', '2024-01-01', '2024-01-02', 0, 1);

INSERT INTO public.fichie(c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul, s07_reffor, s07_refimp, s07_refsup, s07_reftri, s07_refech, s07_refecl, n07_nbrrep, s07_ficatt, s07_verloc, n07_maxpag, b07_specim, b07_cbadre, b07_ediver, b07_banimp, b07_appbac, s07_codadr, s07_codprd, n07_repexp, s07_typsig, s07_codcli, s07_coddoc, b07_eclate)
VALUES ('T', '780', 'SNV2', 'PD11', 'L00', 'TABLEAUX RECAP', 'B', 'I', '-', '724', 'PD24A08', '800', null, 'LOT3-1', null, 0, '    RECTO-SIMPLE    ', null, 5, 0, 1, 0, 1, 0, null, 'PD24T', 1, 'R', 'URSSAFRP', null, 0),
       ('T', '780', 'SNV2', 'PD16', 'L01', 'ECHEANCIER TRIMESTRIEL PRELEVE   QD14E ', 'B', 'I', '-', '724', 'QD14D72', '800', null, 'LOT3-1', null, 0, '    RECTO-VERSO   ', null, 5, 0, 1, 0, 1, 0, null, 'QD14E', 1, 'R', 'URSSAFRP', null, 0),
       ('P', '010', 'SNV2', 'AD04', 'L00', 'Fichier AD04 L00', 'B', 'I', '-', '724', 'QDI9A11', '800', null, 'LOT3-1', null, 0, '    RECTO-SIMPLE    ', null, 5, 0, 1, 0, 1, 0, null, 'QDI9A', 1, 'R', 'URSSAFRP', null, 0),
       ('P', '010', 'SNV2', 'AD04', 'L01', 'Fichier AD04 L01', 'B', 'I', '-', '724', 'QDI9A11', '800', null, 'LOT3-1', null, 0, '    RECTO-SIMPLE    ', null, 5, 0, 1, 0, 1, 0, null, 'QDI9B', 1, 'R', 'URSSAFRP', null, 0),
       ('P', '010', 'SNV2', 'ADEH', 'L00', 'Fichier ADEH L00', 'B', 'I', '-', '724', 'AD16A03', '800', null, 'LOT3-1', null, 0, '    RECTO-SIMPLE    ', null, 5, 0, 1, 0, 1, 0, null, 'AD16A', 1, 'R', 'URSSAFRP', null, 0);