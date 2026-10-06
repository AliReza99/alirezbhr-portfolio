import { Link } from 'react-router';
import { MorphLabel } from '../components/ui/morph-label';
import { RoughArrow } from '../components/ui/rough-arrow';
import './not-found-page.css';

export const NotFoundPage = () => (
  <main className="not-found">
    <span className="hand not-found__note">wrong turn.</span>
    <h1 className="not-found__title">This page doesn't exist. Not even in the basement.</h1>
    <Link to="/" className="press-btn">
      <span data-wob="" className="btn-shadow press-btn__shadow" />
      <span className="press-btn__face">
        <MorphLabel>Back home</MorphLabel>
        <RoughArrow dir="e" />
      </span>
    </Link>
  </main>
);
