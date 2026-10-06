import './section-header.css';

type SectionHeaderProps = {
  title: string;
  note: string;
};

export const SectionHeader = ({ title, note }: SectionHeaderProps) => (
  <div className="section-header">
    <h2 className="section-header__title">{title}</h2>
    <span className="hand section-header__note">{note}</span>
    <span data-rule="" />
  </div>
);
