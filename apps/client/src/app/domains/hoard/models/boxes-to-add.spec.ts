import { parseBoxesToAdd } from './boxes-to-add';
import { InvalidBoxCountError } from './invalid-box-count.error';

describe('Boxes to add', () => {
  it('refuses fewer than one box', () => {
    const parse = () => parseBoxesToAdd({ boxes: 0, tags: [] });

    expect(parse).toThrow(InvalidBoxCountError);
  });

  it('refuses part of a box', () => {
    const parse = () => parseBoxesToAdd({ boxes: 1.5, tags: [] });

    expect(parse).toThrow(InvalidBoxCountError);
  });
});
