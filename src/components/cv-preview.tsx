/**
 * Pré-visualização visual real do CV — 4 templates genuinamente distintos
 * (layout, tipografia, hierarquia), não apenas uma mudança de cor.
 *
 * Puramente determinístico (sem IA) — reflete exactamente os campos que o
 * cv-builder.ts (geração final) também usa, para a pré-visualização nunca
 * mentir sobre o resultado real.
 */

import { formatDate } from "@/lib/dokvera";

export type CvTemplateId = "classic" | "modern" | "minimal" | "bold";

type Props = {
  fields: Record<string, unknown>;
  templateId: CvTemplateId;
  /** Ids das secções opcionais selecionadas. Vazio = mostra todas. */
  structure?: string[];
  country?: string | null | undefined;
};

function str(fields: Record<string, unknown>, key: string): string {
  const value = fields[key];
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join("\n");
  return String(value).trim();
}

function list(fields: Record<string, unknown>, key: string): string[] {
  const value = fields[key];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const SECTION_LABELS: { id: string; heading: string; fieldId: string }[] = [
  { id: "experience", heading: "Experiência Profissional", fieldId: "experience" },
  { id: "education", heading: "Formação Académica", fieldId: "education" },
  { id: "skills", heading: "Competências", fieldId: "skills" },
  { id: "languages", heading: "Idiomas", fieldId: "languages" },
  { id: "certifications", heading: "Certificações e Cursos", fieldId: "certifications" },
  { id: "projects", heading: "Projectos", fieldId: "projects" },
  { id: "volunteering", heading: "Voluntariado", fieldId: "volunteering" },
  { id: "references", heading: "Referências", fieldId: "references_list" },
];

const SIDEBAR_SECTIONS = new Set(["skills", "languages"]);

function usePreviewData(fields: Record<string, unknown>, structure: string[], country?: string | null) {
  const include = (id: string) => structure.length === 0 || structure.includes(id);

  const name = str(fields, "full_name") || "O Teu Nome";
  const headline = str(fields, "headline");
  const contacts = [
    str(fields, "email"),
    str(fields, "phone"),
    str(fields, "address"),
    str(fields, "linkedin"),
  ].filter(Boolean);

  const personal = [
    str(fields, "birth_date") ? `Nascimento: ${formatDate(str(fields, "birth_date"), country)}` : "",
    str(fields, "nationality") ? `Nacionalidade: ${str(fields, "nationality")}` : "",
    str(fields, "driving_license") ? `Carta de condução: ${str(fields, "driving_license")}` : "",
  ].filter(Boolean);

  const profile = str(fields, "profile");
  const sections = SECTION_LABELS.filter((s) => include(s.id) && list(fields, s.fieldId).length > 0).map((s) => ({
    ...s,
    items: list(fields, s.fieldId),
  }));

  return { name, headline, contacts, personal, profile, sections, includeProfile: include("profile") };
}

function EmptyEntryHint({ label }: { label: string }) {
  return <p className="text-[11px] italic text-muted-foreground/70">{label} — por preencher</p>;
}

/** Template 1 — Clássico: uma coluna, sóbrio, ótimo para banca/função pública. */
function ClassicTemplate({ data }: { data: ReturnType<typeof usePreviewData> }) {
  return (
    <div className="mx-auto flex h-full max-w-[210mm] flex-col bg-white p-10 font-serif text-neutral-900">
      <header className="border-b-2 border-neutral-900 pb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{data.name}</h1>
        {data.headline && <p className="mt-1 text-sm text-neutral-600">{data.headline}</p>}
        {data.contacts.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500">{data.contacts.join("  ·  ")}</p>
        )}
      </header>

      {data.includeProfile && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800">Perfil Profissional</h2>
          <div className="mt-1 h-px bg-neutral-300" />
          {data.profile ? (
            <p className="mt-2 text-[13px] leading-relaxed">{data.profile}</p>
          ) : (
            <div className="mt-2"><EmptyEntryHint label="Resumo profissional" /></div>
          )}
        </section>
      )}

      {data.personal.length > 0 && (
        <p className="mt-3 text-[11px] text-neutral-500">{data.personal.join("  ·  ")}</p>
      )}

      {data.sections.map((section) => (
        <section key={section.id} className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800">{section.heading}</h2>
          <div className="mt-1 h-px bg-neutral-300" />
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
            {section.items.map((item, i) => (
              <li key={i} className="list-disc pl-4 marker:text-neutral-400">{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Template 2 — Moderno: duas colunas, barra lateral escura para contactos/competências. */
function ModernTemplate({ data }: { data: ReturnType<typeof usePreviewData> }) {
  const sidebarSections = data.sections.filter((s) => SIDEBAR_SECTIONS.has(s.id));
  const mainSections = data.sections.filter((s) => !SIDEBAR_SECTIONS.has(s.id));

  return (
    <div className="mx-auto flex h-full max-w-[210mm] bg-white font-sans text-neutral-900">
      <aside className="w-[34%] shrink-0 bg-slate-800 p-6 text-slate-100">
        <div className="mx-auto mb-4 size-16 rounded-full bg-slate-600" aria-hidden />
        <h1 className="text-lg font-bold leading-tight text-white">{data.name}</h1>
        {data.headline && <p className="mt-1 text-xs text-slate-300">{data.headline}</p>}

        {data.contacts.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contacto</h2>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
              {data.contacts.map((c, i) => <li key={i} className="break-words">{c}</li>)}
            </ul>
          </div>
        )}

        {sidebarSections.map((section) => (
          <div key={section.id} className="mt-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{section.heading}</h2>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
              {section.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        ))}
      </aside>

      <main className="flex-1 p-7">
        {data.includeProfile && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">Perfil</h2>
            {data.profile ? (
              <p className="mt-2 text-[13px] leading-relaxed">{data.profile}</p>
            ) : (
              <EmptyEntryHint label="Resumo profissional" />
            )}
          </section>
        )}
        {mainSections.map((section) => (
          <section key={section.id} className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">{section.heading}</h2>
            <div className="mt-1 h-0.5 w-8 bg-slate-700" />
            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
              {section.items.map((item, i) => (
                <li key={i} className="list-disc pl-4 marker:text-slate-400">{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

/** Template 3 — Minimalista: muito espaço branco, tipografia leve, sem linhas divisórias. */
function MinimalTemplate({ data }: { data: ReturnType<typeof usePreviewData> }) {
  return (
    <div className="mx-auto flex h-full max-w-[210mm] flex-col bg-white p-14 font-sans text-neutral-800">
      <header>
        <h1 className="text-3xl font-light tracking-tight text-neutral-900">{data.name}</h1>
        {data.headline && <p className="mt-1 text-sm font-light text-neutral-500">{data.headline}</p>}
        {data.contacts.length > 0 && (
          <p className="mt-3 text-[11px] font-light tracking-wide text-neutral-400">{data.contacts.join("   ")}</p>
        )}
      </header>

      {data.includeProfile && (
        <section className="mt-8">
          {data.profile ? (
            <p className="text-[13px] font-light leading-loose text-neutral-700">{data.profile}</p>
          ) : (
            <EmptyEntryHint label="Resumo profissional" />
          )}
        </section>
      )}

      {data.sections.map((section) => (
        <section key={section.id} className="mt-8">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">{section.heading}</h2>
          <ul className="mt-3 space-y-2 text-[13px] font-light leading-loose text-neutral-700">
            {section.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Template 4 — Destaque: cabeçalho forte a cor, bom para áreas criativas/vendas. */
function BoldTemplate({ data }: { data: ReturnType<typeof usePreviewData> }) {
  return (
    <div className="mx-auto flex h-full max-w-[210mm] flex-col bg-white font-sans text-neutral-900">
      <header className="bg-primary px-10 py-8 text-primary-foreground">
        <h1 className="text-3xl font-extrabold leading-tight">{data.name}</h1>
        {data.headline && <p className="mt-1 text-base font-medium opacity-90">{data.headline}</p>}
        {data.contacts.length > 0 && (
          <p className="mt-3 text-[12px] opacity-80">{data.contacts.join("   ·   ")}</p>
        )}
      </header>

      <div className="p-10">
        {data.includeProfile && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary">Perfil</h2>
            {data.profile ? (
              <p className="mt-2 text-[13px] leading-relaxed">{data.profile}</p>
            ) : (
              <EmptyEntryHint label="Resumo profissional" />
            )}
          </section>
        )}
        {data.sections.map((section) => (
          <section key={section.id} className="mt-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary">{section.heading}</h2>
            <div className="mt-1 h-1 w-10 rounded-full bg-primary" />
            <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed">
              {section.items.map((item, i) => (
                <li key={i} className="list-disc pl-4 marker:text-primary">{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function CvPreview({ fields, templateId, structure = [], country }: Props) {
  const data = usePreviewData(fields, structure, country);

  return (
    <div className="h-full w-full overflow-y-auto rounded-2xl border border-border/70 bg-neutral-100 shadow-inner">
      <div className="min-h-full py-6">
        {templateId === "modern" && <ModernTemplate data={data} />}
        {templateId === "minimal" && <MinimalTemplate data={data} />}
        {templateId === "bold" && <BoldTemplate data={data} />}
        {(templateId === "classic" || !templateId) && <ClassicTemplate data={data} />}
      </div>
    </div>
  );
}
