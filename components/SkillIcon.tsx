import Image from "next/image";
import { displaySkill } from "@/lib/stack";

interface SkillIconProps {
  name: string;
  icon?: string;
  category?: string;
}

export default function SkillIcon({ name, icon }: SkillIconProps) {
  return (
    <span className="tile">
      {icon ? (
        <i className="img"><Image src={icon} alt={name} width={20} height={20} style={{ objectFit: "contain" }} /></i>
      ) : (
        <i>{displaySkill(name).charAt(0).toUpperCase()}</i>
      )}
      {displaySkill(name)}
    </span>
  );
}
