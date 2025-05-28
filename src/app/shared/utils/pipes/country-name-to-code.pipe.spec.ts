import { CountryNameToCodePipe } from './country-name-to-code.pipe';

describe('CountryNameToCodePipe', () => {
  it('create an instance', () => {
    const pipe = new CountryNameToCodePipe();
    expect(pipe).toBeTruthy();
  });
});
