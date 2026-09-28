import { TextFormat, TextFormatPipe } from './text-format.service';

describe('TextFormatService', () => {
  const pipe: TextFormatPipe = new TextFormatPipe();

  it('Should return the string with spaces', () => {
    expect(pipe.transform('123456789', TextFormat.SIREN)).toEqual('123 456 789');
    expect(pipe.transform('12345678912345', TextFormat.SIRET)).toEqual('123 456 789 12345');
    expect(pipe.transform('123456789123412', TextFormat.NIR)).toEqual('1 23 45 67 891 234 12');
    expect(pipe.transform('1234567891234', TextFormat.NIR)).toEqual('1 23 45 67 891 234');
    expect(pipe.transform()).toEqual('');
    expect(pipe.transform(null, TextFormat.NIR)).toEqual('-');
  });
});
