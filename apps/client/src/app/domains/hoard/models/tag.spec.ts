import { parseTags } from './tag';

describe('Tags', () => {
  it('keeps each tag once, without surrounding spaces, and drops empty ones', () => {
    const tags = parseTags([' Gift ', 'Gift', '', '  ', 'Shelf of shame']);

    expect(tags).toEqual(['Gift', 'Shelf of shame']);
  });
});
