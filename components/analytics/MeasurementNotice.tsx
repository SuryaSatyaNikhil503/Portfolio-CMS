"use client";

import { useEffect, useState } from "react";

/** One-time, equal-weight notice. Measurement is anonymous; "Turn off" stops it on this device. */
export default function MeasurementNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("measure-notice")) setShow(true);
    } catch { /* storage blocked: stay quiet */ }
  }, []);

  if (!show) return null;
  const close = (off: boolean) => {
    try {
      localStorage.setItem("measure-notice", "seen");
      if (off) localStorage.setItem("measure", "off");
    } catch { /* ignore */ }
    setShow(false);
  };

  return (
    <div className="mnotice" role="region" aria-label="Measurement notice">
      <p>
        <b>I count visits anonymously.</b> Pages, time spent and city. No IP address, no cookies, no ads, nothing that identifies you.{" "}
        <a href="/privacy">Details</a>
      </p>
      <div className="row">
        <button type="button" className="btn s p" onClick={() => close(false)}>Got it</button>
        <button type="button" className="btn s" onClick={() => close(true)}>Turn off</button>
      </div>
    </div>
  );
}
