INSERT INTO Verrou (C75_Codver, S75_Libver, N75_Maxexe) VALUES
    ('A',  'VERROU SANS GAMME',        1),
    ('B',  'VERROU AVEC UNE GAMME',    5),
    ('C',  'VERROU AVEC MULTI GAMMES', 9),
    ('D',  'AUTRE VERROU SANS GAMME',  3);

INSERT INTO Gammes (C06_Codgam, S06_Libgam, S06_Codver) VALUES
    ('G1', 'Gamme liee a B',      'B'),
    ('G2', 'Gamme liee a C #1',   'C'),
    ('G3', 'Gamme liee a C #2',   'C'),
    ('G4', 'Gamme liee a C #3',   'C'),
    ('G0', 'Gamme orpheline',     NULL);
