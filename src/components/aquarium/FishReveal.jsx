import ContentCard from '../shared/ContentCard';

const TYPE_LABELS = {
  quote: 'quote',
  book: 'book rec',
  fact: 'fun fact',
  interest: 'something i love',
};

export default function FishReveal({ item, onClose }) {
  if (!item) return null;

  const label = TYPE_LABELS[item.type] || item.type;

  return (
    <ContentCard isOpen={!!item} onClose={onClose} title={item.title}>
      <div
        style={{
          display: 'inline-block',
          background: item.fishColor + '33',
          border: `1.5px solid ${item.fishColor}`,
          borderRadius: '999px',
          padding: '0.2rem 0.75rem',
          fontSize: '0.75rem',
          fontFamily: "'DynaPuff', sans-serif",
          color: '#4a3728',
          marginBottom: '1rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontFamily: "'DynaPuff', sans-serif",
          fontSize: '1rem',
          lineHeight: 1.65,
          color: '#4a3728',
          margin: 0,
        }}
      >
        {item.content}
      </p>
    </ContentCard>
  );
}
