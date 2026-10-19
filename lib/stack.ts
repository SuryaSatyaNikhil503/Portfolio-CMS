// The skill layers shown on Home. They mirror the six slabs of the 3D stack.
export interface SkillLike { name: string; category: string }
export interface Layer { title: string; color: string; names?: string[]; category?: string; extra?: string[] }

export const LAYERS: Layer[] = [
  { title: "Client", color: "var(--c1)", names: ["React", "Javascript"] },
  { title: "Services", color: "var(--c2)", names: ["Java", "Spring Boot", "Microservices", "Rest API"] },
  { title: "AI Integrations", color: "var(--c5)", extra: ["LLM APIs", "RAG", "Embeddings"] },
  { title: "Agents", color: "var(--c3)", extra: ["Agentic AI", "Multi-agent systems"] },
  { title: "Database", color: "var(--c4)", category: "Database" },
  { title: "Delivery", color: "var(--c1)", category: "DevOps" },
];

/** Display-only clean-up of names typed in the admin. */
export function displaySkill(name: string): string {
  return /^postgres?sql$/i.test(name) ? "PostgreSQL" : name;
}

export function layerTiles(layer: Layer, skills: SkillLike[]): string[] {
  const fromDb = layer.category
    ? skills.filter((s) => s.category === layer.category).map((s) => s.name)
    : (layer.names ?? []).flatMap((n) => skills.filter((s) => s.name.toLowerCase() === n.toLowerCase()).map((s) => s.name));
  return [...fromDb, ...(layer.extra ?? [])].map(displaySkill);
}
