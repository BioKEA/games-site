import { describe, it, expect } from 'vitest';
import { checkBundle, findStaleGameUrls } from '../../scripts/verify-games.mjs';

const GOOD =
  '<html><head><script async src="https://www.googletagmanager.com/gtag/js?id=G-WYL7J2D7SG"></script></head>' +
  '<body><a href="/" id="biokea-back">All Games</a>' +
  '<a href="https://biokea.ai/subscribe?source=codon2048" id="biokea-subscribe">Lab updates</a></body></html>';

describe('checkBundle', () => {
  it('accepts a bundle with the rewritten injections', () => {
    expect(checkBundle(GOOD, 'codon2048')).toEqual([]);
  });

  it('flags a back button that still points at the old marketing path', () => {
    const html = GOOD.replace(
      'href="/" id="biokea-back"',
      'href="/mission/games/" id="biokea-back"',
    );
    expect(checkBundle(html, 'codon2048')).toContain('back button href is not "/"');
  });

  it('flags a relative subscribe pill', () => {
    const html = GOOD.replace(
      'https://biokea.ai/subscribe?source=codon2048',
      '/subscribe?source=codon2048',
    );
    expect(checkBundle(html, 'codon2048')).toContain('subscribe pill is not absolute to biokea.ai');
  });

  it('flags a missing analytics snippet', () => {
    const html = GOOD.replace('G-WYL7J2D7SG', 'G-NOPE');
    expect(checkBundle(html, 'codon2048')).toContain('GA snippet missing');
  });
});

describe('findStaleGameUrls', () => {
  it('returns nothing when no file references the retired biokea.ai/mission/games paths', () => {
    expect(
      findStaleGameUrls([
        { name: 'index.html', content: GOOD },
        { name: 'assets/index-abc.js', content: 'href:"https://games.biokea.ai/leaderboard"' },
      ]),
    ).toEqual([]);
  });

  it('names each file that still hardcodes a biokea.ai/mission/games URL', () => {
    const problems = findStaleGameUrls([
      { name: 'index.html', content: GOOD },
      {
        name: 'assets/index-abc.js',
        content: 'description:"View it at biokea.ai/mission/games/leaderboard"',
      },
      { name: 'assets/vendor-def.js', content: 'shown publicly on biokea.ai/mission/games/.' },
    ]);
    expect(problems).toEqual([
      'assets/index-abc.js references retired biokea.ai/mission/games URL',
      'assets/vendor-def.js references retired biokea.ai/mission/games URL',
    ]);
  });
});
