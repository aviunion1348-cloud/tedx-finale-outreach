import { domainLabel, domainAccent } from "@/lib/domains";

export default function DomainTag({ id, small }: { id: string; small?: boolean }) {
  const accent = domainAccent(id);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono uppercase tracking-wider"
      style={{
        borderColor: accent + "55",
        color: accent,
        fontSize: small ? 9 : 10,
        background: accent + "11",
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
      />
      {domainLabel(id)}
    </span>
  );
}
