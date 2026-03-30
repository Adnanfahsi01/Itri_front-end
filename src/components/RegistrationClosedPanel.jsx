import { registrationClosedBadge, registrationClosedMessage, registrationClosedSecondary } from '../config/registration';

function RegistrationClosedPanel({
  title = 'This event is sold out',
  message = registrationClosedMessage,
  secondaryMessage = registrationClosedSecondary,
  className = '',
}) {
  return (
    <div className={`w-full rounded-2xl border border-slate-600 bg-slate-800/70 p-6 md:p-8 text-center backdrop-blur-sm ${className}`.trim()}>
      <span className="inline-flex items-center rounded-full border border-slate-500 bg-slate-700 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
        {registrationClosedBadge}
      </span>
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-slate-100">{title}</h2>
      <p className="mt-3 text-slate-300">{message}</p>
      <p className="mt-2 text-sm text-slate-400">{secondaryMessage}</p>
    </div>
  );
}

export default RegistrationClosedPanel;
