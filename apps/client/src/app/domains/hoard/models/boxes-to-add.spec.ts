import { EmptyBoxError, InvalidRowsError } from '@greyhoarder/domain/hoard';
import { parseBoxesToAdd } from './boxes-to-add';
import { InvalidBoxCountError } from './invalid-box-count.error';
import { MissingBoxNameError } from './missing-box-name.error';

const BOYZ_BOX = { boxes: 1, tags: [], name: 'Boyz (2026)', rows: [9, 1, 1], areSprues: false };

describe('Boxes to add', () => {
  it('refuses fewer than one box', () => {
    const parse = () => parseBoxesToAdd({ boxes: 0, tags: [] });

    expect(parse).toThrow(InvalidBoxCountError);
  });

  it('refuses part of a box', () => {
    const parse = () => parseBoxesToAdd({ boxes: 1.5, tags: [] });

    expect(parse).toThrow(InvalidBoxCountError);
  });

  it('refuses boxes without any mini', () => {
    const parse = () => parseBoxesToAdd({ ...BOYZ_BOX, rows: [0, 0, 0] });

    expect(parse).toThrow(EmptyBoxError);
  });

  it('refuses boxes without a name', () => {
    const parse = () => parseBoxesToAdd({ ...BOYZ_BOX, name: '  ' });

    expect(parse).toThrow(MissingBoxNameError);
  });

  it('refuses a row with fewer than no minis', () => {
    const parse = () => parseBoxesToAdd({ ...BOYZ_BOX, rows: [9, -1, 1] });

    expect(parse).toThrow(InvalidRowsError);
  });
});
