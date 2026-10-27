import { parseDeparture } from './mini-departure.js';

describe('Mini departure', () => {
  it('keeps the recipients of a mini stripped for parts', () => {
    const departure = parseDeparture({
      reason: 'stripped',
      on: '2026-10-12',
      recipientMiniIds: ['2', '3'],
    });

    expect(departure.recipientMiniIds).toEqual(['2', '3']);
  });

  it('drops the recipients for every other reason', () => {
    const departure = parseDeparture({ reason: 'sold', on: '2026-10-12', recipientMiniIds: ['2'] });

    expect(departure).toEqual({ reason: 'sold', on: '2026-10-12' });
  });

  it('lists each recipient once', () => {
    const departure = parseDeparture({
      reason: 'stripped',
      on: '2026-10-12',
      recipientMiniIds: ['2', '2', '3'],
    });

    expect(departure.recipientMiniIds).toEqual(['2', '3']);
  });

  it('leaves out an empty list of recipients', () => {
    const departure = parseDeparture({
      reason: 'stripped',
      on: '2026-10-12',
      recipientMiniIds: [],
    });

    expect(departure).toEqual({ reason: 'stripped', on: '2026-10-12' });
  });
});
