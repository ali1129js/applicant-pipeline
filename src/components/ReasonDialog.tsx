import { useEffect, useId, useRef, useState } from "react";
import type { UIStrings } from "../lib/i18n";

interface Props {
  name: string;
  strings: UIStrings;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function ReasonDialog({ name, strings, onCancel, onConfirm }: Props) {
  const titleId = useId();
  const inputId = useId();
  const [reason, setReason] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const error = reason.trim().length === 0;

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }}
      >
        <h2 id={titleId}>{strings.rejectTitle}</h2>
        <p>{strings.rejectBody(name)}</p>
        <label htmlFor={inputId}>{strings.rejectReasonLabel}</label>
        <input id={inputId} value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="dialog-actions">
          <button type="button" className="button" ref={cancelRef} onClick={onCancel}>
            {strings.rejectCancel}
          </button>
          <button
            type="button"
            className="button button-danger"
            onClick={() => {
              if (!error) onConfirm(reason);
            }}
          >
            {strings.rejectConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
