import { CountryCodeToNamePipe } from './country-code-to-name.pipe';

describe('CountryCodeToNamePipe', () => {
  it('create an instance', () => {
    const pipe = new CountryCodeToNamePipe();
    expect(pipe).toBeTruthy();
  });
});
