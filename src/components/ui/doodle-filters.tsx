/** Three turbulence filters cycled by the `doo-boil` keyframes for the line-boil effect. */
export const DoodleFilters = () => (
  <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
    {[3, 11, 27].map((seed, k) => (
      <filter key={seed} id={`doo-r${k + 1}`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.6} />
      </filter>
    ))}
  </svg>
);
