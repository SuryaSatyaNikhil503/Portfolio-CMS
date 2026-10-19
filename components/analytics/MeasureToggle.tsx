"use client";

import { useEffect, useState } from "react";

export default function MeasureToggle() {
  const [off, setOff] = useState(false);
  useEffect(() => { try { setOff(localStorage.getItem("measure") === "off"); } catch { /* ignore */ } }, []);
  const toggle = () => {
    const next = !off;
    try { if (next) localStorage.setItem("measure", "off"); else localStorage.removeItem("measure"); localStorage.setItem("measure-notice", "seen"); } catch { /* ignore */ }
    setOff(next);
  };
  return (
    <button type="button" className={"btn" + (off ? " p" : "")} onClick={toggle} aria-pressed={off}>
      {off ? "Measurement is off on this device. Turn it back on" : "Turn measurement off on this device"}
    </button>
  );
}
