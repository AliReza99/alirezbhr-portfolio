import type { Segment } from '../../data/experience';

export const RichText = ({ segments }: { segments: Segment[] }) =>
  segments.map((s, i) => {
    if (typeof s === 'string') return s;
    if ('hl' in s)
      return (
        <strong key={i} data-hl="" style={{ fontWeight: 600 }}>
          {s.hl}
        </strong>
      );
    return (
      <strong key={i} style={{ fontWeight: 600, color: 'var(--ink)' }}>
        {s.b}
      </strong>
    );
  });
