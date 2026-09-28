INSERT INTO destin (c10_codorg, c10_coddes, s10_libdes, s10_refpri) VALUES
    ('OR1', 'D01',     'DEST SANS EXEMPLAIRE',       'REF-D01'),
    ('OR1', 'D02',     'DEST AVEC UN EXEMPLAIRE',    'REF-D02'),
    ('OR1', 'D03',     'DEST AVEC MULTI EXEMPLAIRES', NULL),
    ('OR2', 'D04',     'AUTRE DEST SANS EXEMPLAIRE', 'REF-D04');

INSERT INTO exempl (c11_codenv, c11_codorg, c11_codapp, c11_codcom, c11_codfic, c11_codgam, c11_numexe,
                    s11_codsit, s11_codres, s11_coddes, n11_nbrexe, b11_exeact) VALUES
    ('C', 'OR1', 'APP1', 'COM1', 'FIC01', 'G1', '01', 'SIT001', 'RES00001', 'D02', 1, 1),
    ('C', 'OR1', 'APP1', 'COM1', 'FIC01', 'G1', '02', 'SIT001', 'RES00001', 'D03', 1, 1),
    ('C', 'OR1', 'APP1', 'COM1', 'FIC01', 'G1', '03', 'SIT001', 'RES00001', 'D03', 1, 1),
    ('C', 'OR1', 'APP1', 'COM1', 'FIC01', 'G1', '04', 'SIT001', 'RES00001', 'D03', 1, 1),
    ('C', 'OR1', 'APP1', 'COM1', 'FIC01', 'G1', '05', 'SIT001', 'RES00001', 'D99', 1, 1);
