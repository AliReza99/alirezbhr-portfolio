import { TOASTS } from '../../data/toasts';
import { useToastState } from './toast-context';
import './toast.css';

const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w)\}/g, (_, k: string) => vars[k] ?? '');

export const Toast = () => {
  const { open, kind, index, vars, close } = useToastState();
  const [title, body] = TOASTS[kind][index] ?? TOASTS.exp[0];

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast"
      style={{
        transform: `translate(-50%,${open ? '0px' : 'calc(100% + 60px)'}) rotate(-1.5deg)`,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div className="toast__paper">
        <span data-ext="" aria-hidden="true" />
        <span data-tape="" aria-hidden="true" style={{ '--tw': '96px', '--ta': '97deg' }} />
        <div className="toast__body">
          <div className="toast__text">
            <span className="toast__title">{fill(title, vars)}</span>
            <p className="toast__message">{fill(body, vars)}</p>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="close-x close-x--toast">
            <span />
            <span />
          </button>
        </div>
      </div>
    </div>
  );
};
