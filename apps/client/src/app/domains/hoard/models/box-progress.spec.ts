import { boxProgress, progressPercent } from './box-progress';
import { EmptyBoxError } from '@greyhoarder/domain/hoard';

describe('Box progress', () => {
  it('calls a box untouched while all of its minis are on the sprue', () => {
    const progress = boxProgress(['sprue', 'sprue']);

    expect(progress).toBe('untouched');
  });

  it('counts a box as started once one of its minis is off the sprue', () => {
    const progresses = [
      boxProgress(['sprue', 'built']),
      boxProgress(['sprue', 'primed']),
      boxProgress(['sprue', 'painted']),
    ];

    expect(progresses).toEqual(['started', 'started', 'started']);
  });

  it('calls a box done once all of its minis are painted or done', () => {
    const progress = boxProgress(['painted', 'done']);

    expect(progress).toBe('done');
  });

  it('counts each mini by its status in equal steps from 0 to 100', () => {
    const percents = [
      progressPercent(['sprue']),
      progressPercent(['built']),
      progressPercent(['primed']),
      progressPercent(['painted']),
      progressPercent(['done']),
    ];

    expect(percents).toEqual([0, 25, 50, 75, 100]);
  });

  it('averages the minis of a box and rounds the result', () => {
    const percent = progressPercent(['sprue', 'built', 'built']);

    expect(percent).toBe(17);
  });

  it('refuses to rate a box without minis', () => {
    const rate = [() => boxProgress([]), () => progressPercent([])];

    rate.forEach((rateBox) => expect(rateBox).toThrow(EmptyBoxError));
  });
});
