import { Metadata } from "next";
import prisma from "@/lib/prisma";
import MeasureToggle from "@/components/analytics/MeasureToggle";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site measures, what it never collects, and how to turn measurement off.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const about = await prisma.about.findFirst({ select: { linkedinUrl: true, githubUrl: true } }).catch(() => null);
  return (
    <>
      <div className="pagehead">
        <h1 className="eyebrow">Privacy</h1>
        <p className="display">What this site measures</p>
        <p className="lead">I want to know which articles help people and where readers come from. This page lists exactly what is counted.</p>
      </div>
      <section className="sec">
        <div style={{ maxWidth: 720, marginInline: "auto" }} className="article">
          <h2>What is counted</h2>
          <ul>
            <li>Which pages you open and in what order, during one visit.</li>
            <li>How long you stayed on each page and how far down you scrolled.</li>
            <li>Where you came from, for example Google or LinkedIn (the website, never the address you typed).</li>
            <li>Your device type, operating system and browser.</li>
            <li>Your country and city, taken from your network at the moment of the visit.</li>
            <li>Whether you downloaded the résumé, subscribed or commented.</li>
          </ul>
          <h2>What is never collected</h2>
          <ul>
            <li>Your IP address. It is not stored, not hashed and not masked.</li>
            <li>Cookies or any identifier that lasts beyond the visit. A random code lives in your browser tab and disappears when you close it.</li>
            <li>Your name, email or phone number, unless you give them to me yourself in the subscribe or comment form.</li>
            <li>Anything that follows you to other sites. No ads, no third-party trackers.</li>
          </ul>
          <h2>Linking to your email (optional)</h2>
          <p>The subscribe form has an unticked box: &quot;Also let me see which pages I read before subscribing&quot;. Only if you tick it, that one visit is connected to your email. Leave it unticked and your visit stays anonymous.</p>
          <h2>How long it is kept</h2>
          <p>Visit records are deleted automatically after 90 days.</p>
          <h2>Turn it off</h2>
          <p>Nothing is measured if your browser sends Global Privacy Control or Do Not Track, or if you turn it off here. The choice is saved on this device only.</p>
          <p><MeasureToggle /></p>
          <h2>Questions, access or deletion</h2>
          <p>
            If you subscribed or commented and want your details corrected or removed, message me
            {about?.linkedinUrl ? <> on <a href={about.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a></> : null}
            {about?.githubUrl ? <> or <a href={about.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a></> : null}
            , or reply to any newsletter email. I will act on it within 30 days.
          </p>
        </div>
      </section>
    </>
  );
}
