interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  gradient?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  gradient = true,
}: SectionHeadingProps) {
  return (
    <div className="text-center mb-16 animate-fade-up">
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
          gradient ? "gradient-text" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="mt-6 mx-auto w-20 h-1 rounded-full gradient-bg" />
    </div>
  );
}
