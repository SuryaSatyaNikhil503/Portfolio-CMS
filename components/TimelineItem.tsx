import Image from "next/image";

interface TimelineItemProps {
  company: string;
  role: string;
  companyLogo?: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  isLast?: boolean;
}

export default function TimelineItem({ company, role, companyLogo, location, startDate, endDate, description }: TimelineItemProps) {
  return (
    <div className="item">
      <span className="logo2">
        {companyLogo ? <Image src={companyLogo} alt={company} width={40} height={40} style={{ objectFit: "contain" }} /> : company.slice(0, 2)}
      </span>
      <div className="card">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <h3>{role}</h3>
          <span className="chip soft">{startDate} — {endDate}</span>
        </div>
        <div className="muted" style={{ fontWeight: 600 }}>{company}{location ? ` · ${location}` : ""}</div>
        {description && <div className="article" style={{ fontSize: 16 }}><p>{description}</p></div>}
      </div>
    </div>
  );
}
