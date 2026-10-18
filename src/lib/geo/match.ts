import { MAPS, type MapId, type MapRegion } from "./maps";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\b(state|the|republic of)\b/g, "").trim();

const ALIASES: Record<string, string> = {
  abuja: "FC", fct: "FC", "fct abuja": "FC", "federal capital territory": "FC", nassarawa: "NA", "akwa-ibom": "AK",
  "ivory coast": "CIV", "cote d ivoire": "CIV", drc: "COD", "dr congo": "COD", "congo kinshasa": "COD", "congo brazzaville": "COG",
  "south sudan": "SDS", eswatini: "SWZ", swaziland: "SWZ", "cape verde": "CPV", "cabo verde": "CPV", tanzania: "TZA", gambia: "GMB",
  "central african": "CAF", "equatorial guinea": "GNQ", "sao tome": "STP", "sao tome and principe": "STP", "western sahara": "SAH",
};

/** Resolve a chart label ("Lagos", "LA", "Abuja", "Ghana", "GHA") to a map region. */
export function findRegion(map: MapId, label: string): MapRegion | undefined {
  const regions = MAPS[map].regions;
  const n = norm(label);
  if (!n) return undefined;
  const alias = ALIASES[n];
  return (
    regions.find((r) => r.id.toLowerCase() === (alias ?? n).toLowerCase()) ??
    regions.find((r) => norm(r.name) === n) ??
    regions.find((r) => norm(r.name).startsWith(n) || n.startsWith(norm(r.name)))
  );
}

export { MAPS, type MapId, type MapRegion };
