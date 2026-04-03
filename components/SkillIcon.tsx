interface SkillIconProps {
  name: string;
  icon?: string;
  category?: string;
}

export default function SkillIcon({ name, icon }: SkillIconProps) {
  return (
    <div className="group flex flex-col items-center gap-3 p-4 glass rounded-xl card-hover cursor-default">
      <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
        {icon ? (
          <img src={icon} alt={name} className="w-10 h-10 object-contain" />
        ) : (
          <div className="w-10 h-10 rounded-lg gradient-bg opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
        {name}
      </span>
    </div>
  );
}
