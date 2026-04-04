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

export default function TimelineItem({
  company,
  role,
  companyLogo,
  location,
  startDate,
  endDate,
  description,
  isLast,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-6">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full gradient-bg ring-4 ring-background z-10 flex-shrink-0" />
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-primary/50 to-border/50 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-10 flex-1">
        <div className="glass rounded-xl p-6 card-hover">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {companyLogo ? (
                <Image
                  src={companyLogo}
                  alt={company}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-bold gradient-text">
                  {company.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground">{role}</h3>
              <p className="text-primary font-medium">{company}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span>
                  {startDate} — {endDate}
                </span>
                {location && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <span>{location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {description && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
