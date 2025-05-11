import { TruncateTextLinesPipe } from './truncate-text-lines.pipe';

describe('TruncateTextLinesPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateTextLinesPipe();
    expect(pipe).toBeTruthy();
  });
});
