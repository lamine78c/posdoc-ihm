INSERT INTO Parech (C38_Refech, S38_Typech, N38_Nbrlot, N38_Nbrpag, B38_Random, S38_Formul) VALUES
    ('E01', 'L', 10,   NULL, 0, NULL),
    ('E02', 'P', NULL, 5,    1, 'formule E02'),
    ('E03', 'L', 2,    NULL, 0, NULL),
    ('E04', 'L', 1,    NULL, 0, NULL);

INSERT INTO fichie (c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_refech) VALUES
    ('T', '001', 'A001', 'C001', 'F001', 'E02'),
    ('T', '001', 'A002', 'C001', 'F001', 'E03'),
    ('T', '001', 'A002', 'C001', 'F002', 'E03'),
    ('T', '001', 'A003', 'C001', 'F001', 'E03'),
    ('T', '001', 'A003', 'C001', 'F002', NULL);
