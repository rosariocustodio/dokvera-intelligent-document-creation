import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Calendar,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  User,
  Shield,
  FileCheck,
  Car,
  Plane,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dokvera";
import { getCountryConfig } from "@/lib/countries";

export type CvAccentColor = "indigo" | "emerald" | "burgundy" | "slate" | "amber";

export const CV_ACCENT_COLORS: { id: CvAccentColor; label: string; bg: string; text: string; border: string; hex: string }[] = [
  { id: "indigo", label: "Azul Corporativo", bg: "bg-blue-600", text: "text-blue-600", border: "border-blue-600", hex: "#2563eb" },
  { id: "emerald", label: "Verde Esmeralda", bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600", hex: "#059669" },
  { id: "burgundy", label: "Vinho Nobre", bg: "bg-rose-800", text: "text-rose-800", border: "border-rose-800", hex: "#9f1239" },
  { id: "slate", label: "Grafite Clássico", bg: "bg-slate-800", text: "text-slate-800", border: "border-slate-800", hex: "#1e293b" },
  { id: "amber", label: "Dourado / Âmbar", bg: "bg-amber-600", text: "text-amber-600", border: "border-amber-600", hex: "#d97706" },
];

export type CvData = {
  fullName?: string;
  headline?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  nationality?: string;
  linkedin?: string;
  biNumber?: string;
  nuitNumber?: string;
  drivingLicense?: string;
  travelAvailability?: string;
  profile?: string;
  experience?: string[];
  education?: string[];
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  projects?: string[];
  volunteering?: string[];
  references?: string[];
};

export interface CvDocumentSheetProps {
  data: CvData;
  template?: "modern" | "classic" | "minimal" | "bold" | string;
  accentColor?: CvAccentColor;
  country?: string | null;
  className?: string;
  scale?: number;
}

function parseList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((i) => String(i).trim()).filter(Boolean);
  const str = String(input).trim();
  if (!str) return [];
  if (str.includes("\n")) {
    return str
      .split("\n")
      .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);
  }
  if (str.includes(",") || str.includes(";")) {
    return str
      .split(/[,;]/)
      .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);
  }
  return [str];
}

export function extractCvDataFromFields(fields: Record<string, unknown>, title?: string): CvData {
  const g = (...keys: string[]): string => {
    for (const k of keys) {
      const v = fields[k];
      if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
    }
    return "";
  };
  return {
    fullName: g("full_name") || (title ?? "").trim() || "Seu Nome Completo",
    headline: g("headline") || "Título Profissional / Área Pretendida",
    photoUrl: g("photo_url", "photo"),
    email: g("email"),
    phone: g("phone"),
    location: g("address", "location", "city"),
    birthDate: g("birth_date"),
    nationality: g("nationality"),
    linkedin: g("linkedin"),
    biNumber: g("bi_number", "id_document", "id_number", "cartao_cidadao"),
    nuitNumber: g("nuit_number", "tax_number", "nif_number", "nif"),
    drivingLicense: g("driving_license"),
    travelAvailability: g("travel_availability"),
    profile: g("profile"),
    experience: parseList(fields["experience"]),
    education: parseList(fields["education"]),
    skills: parseList(fields["skills"]),
    languages: parseList(fields["languages"]),
    certifications: parseList(fields["certifications"]),
    projects: parseList(fields["projects"]),
    volunteering: parseList(fields["volunteering"]),
    references: parseList(fields["references_list"] ?? fields["references"]),
  };
}


export function CvDocumentSheet({
  data,
  template = "modern",
  accentColor = "indigo",
  country = "MZ",
  className,
  scale = 1,
}: CvDocumentSheetProps) {
  const accent = CV_ACCENT_COLORS.find((c) => c.id === accentColor) ?? CV_ACCENT_COLORS[0];
  const countryConfig = getCountryConfig(country);
  const idLabel = countryConfig.idDocumentShort;
  const taxLabel = countryConfig.taxNumberShort;

  const travelLabels: Record<string, string> = {
    yes: "Disponibilidade total para viagens e mudanças",
    travel_only: "Disponível para viagens",
    no: "Sem disponibilidade para viagens",
  };

  const hasPersonalDetails =
    Boolean(data.birthDate) ||
    Boolean(data.nationality) ||
    Boolean(data.biNumber) ||
    Boolean(data.nuitNumber) ||
    Boolean(data.drivingLicense) ||
    Boolean(data.travelAvailability);

  // Fallback visual data if user hasn't typed anything yet
  const displayExperience =
    data.experience && data.experience.length > 0
      ? data.experience
      : [
          "Técnico Especialista — Empresa de Referência | 2022 – Presente\nLiderança de projectos de modernização e coordenação de equipas multidisciplinares com foco em eficiência.",
          "Assistente de Operações — Grupo Comercial Lda | 2019 – 2022\nGestão de processos administrativos, atendimento ao cliente e elaboração de relatórios estratégicos.",
        ];

  const displayEducation =
    data.education && data.education.length > 0
      ? data.education
      : [
          "Licenciatura na sua Área de Especialização — Universidade de Referência | 2015 – 2019",
          "Ensino Secundário Geral — Escola Secundária | Concluído com Distinção",
        ];

  const displaySkills =
    data.skills && data.skills.length > 0
      ? data.skills
      : ["Gestão de Projetos", "Comunicação Eficaz", "Análise de Dados", "Trabalho em Equipa", "Microsoft Office & Excel Avançado"];

  const displayLanguages =
    data.languages && data.languages.length > 0
      ? data.languages
      : ["Português (Nativo)", "Inglês (Intermédio / Técnico)"];

  const displayProfile =
    data.profile ||
    "Profissional proativo e orientando a resultados, com sólida experiência no planeamento e execução de tarefas de elevada responsabilidade. Capacidade comprovada de adaptação rápida e foco em inovação e valor para a organização.";

  return (
    <div
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center",
      }}
      className={cn(
        "relative mx-auto w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl transition-all duration-300 font-sans selection:bg-slate-200",
        "print:m-0 print:w-full print:shadow-none print:transform-none",
        className
      )}
    >
      {/* ==================================================================== */}
      {/* TEMPLATE 1: MODERNO (2 COLUNAS / SIDEBAR EXECUTIVA)                  */}
      {/* ==================================================================== */}
      {template === "modern" && (
        <div className="grid min-h-[297mm] grid-cols-12">
          {/* BARRA LATERAL ESQUERDA (4 COLUNAS) */}
          <aside className="col-span-4 flex flex-col justify-between bg-slate-900 p-6 text-slate-100 selection:bg-slate-700">
            <div className="space-y-6">
              {/* Avatar / Iniciais Estilizadas */}
              <div className="flex flex-col items-center text-center">
                {data.photoUrl ? (
                  <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
                    <img src={data.photoUrl} alt={data.fullName} className="size-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="flex size-20 items-center justify-center rounded-2xl text-2xl font-bold tracking-tight text-white shadow-lg"
                    style={{ backgroundColor: accent.hex }}
                  >
                    {data.fullName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "CV"}
                  </div>
                )}
                <h2 className="mt-3 text-sm font-semibold tracking-wide text-slate-200">
                  {data.fullName}
                </h2>
              </div>

              {/* Contactos */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Contactos
                </p>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  {data.email && (
                    <li className="flex items-center gap-2 break-all">
                      <Mail className="size-3.5 shrink-0 text-slate-400" />
                      <span>{data.email}</span>
                    </li>
                  )}
                  {data.phone && (
                    <li className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0 text-slate-400" />
                      <span>{data.phone}</span>
                    </li>
                  )}
                  {data.location && (
                    <li className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-slate-400" />
                      <span>{data.location}</span>
                    </li>
                  )}
                  {data.linkedin && (
                    <li className="flex items-center gap-2 break-all">
                      <Linkedin className="size-3.5 shrink-0 text-slate-400" />
                      <span>{data.linkedin}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Dados Pessoais / Legais */}
              {hasPersonalDetails && (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Dados Pessoais
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {data.birthDate && (
                      <li className="flex items-center gap-2">
                        <Calendar className="size-3.5 shrink-0 text-slate-400" />
                        <span>Nasc.: {formatDate(data.birthDate, country)}</span>
                      </li>
                    )}
                    {data.nationality && (
                      <li className="flex items-center gap-2">
                        <Globe className="size-3.5 shrink-0 text-slate-400" />
                        <span>{data.nationality}</span>
                      </li>
                    )}
                    {data.biNumber && (
                      <li className="flex items-center gap-2">
                        <Shield className="size-3.5 shrink-0 text-slate-400" />
                        <span>{idLabel}: {data.biNumber}</span>
                      </li>
                    )}
                    {data.nuitNumber && (
                      <li className="flex items-center gap-2">
                        <FileCheck className="size-3.5 shrink-0 text-slate-400" />
                        <span>{taxLabel}: {data.nuitNumber}</span>
                      </li>
                    )}
                    {data.drivingLicense && (
                      <li className="flex items-center gap-2">
                        <Car className="size-3.5 shrink-0 text-slate-400" />
                        <span>Carta: {data.drivingLicense}</span>
                      </li>
                    )}
                    {data.travelAvailability && (
                      <li className="flex items-center gap-2">
                        <Plane className="size-3.5 shrink-0 text-slate-400" />
                        <span>{travelLabels[data.travelAvailability] || data.travelAvailability}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Competências */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Competências
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {displaySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-200 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Idiomas */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Idiomas
                </p>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {displayLanguages.map((lang, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full" style={{ backgroundColor: accent.hex }} />
                      <span>{lang}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certificações */}
              {data.certifications && data.certifications.length > 0 && (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Certificações
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {data.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Award className="size-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rodapé da Barra Lateral */}
            <div className="pt-6 text-[9px] text-slate-500 uppercase tracking-widest text-center">
              Dokvera Document Standard
            </div>
          </aside>

          {/* CONTEÚDO PRINCIPAL DIREITA (8 COLUNAS) */}
          <main className="col-span-8 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Cabeçalho */}
              <header className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                  {data.fullName}
                </h1>
                <p className="mt-1 text-sm font-semibold tracking-wide" style={{ color: accent.hex }}>
                  {data.headline}
                </p>
              </header>

              {/* Perfil Profissional */}
              <section className="space-y-2">
                <h3
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1"
                  style={{ borderColor: accent.hex }}
                >
                  <User className="size-3.5" style={{ color: accent.hex }} />
                  Perfil Profissional
                </h3>
                <p className="text-[11.5px] leading-relaxed text-slate-700 text-justify">
                  {displayProfile}
                </p>
              </section>

              {/* Experiência Profissional */}
              <section className="space-y-3">
                <h3
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1"
                  style={{ borderColor: accent.hex }}
                >
                  <Briefcase className="size-3.5" style={{ color: accent.hex }} />
                  Experiência Profissional
                </h3>
                <div className="space-y-3.5">
                  {displayExperience.map((exp, idx) => {
                    const lines = exp.split("\n").filter(Boolean);
                    const titleLine = lines[0] || exp;
                    const desc = lines.slice(1).join(" ");
                    return (
                      <div key={idx} className="relative pl-3 border-l-2" style={{ borderColor: accent.hex }}>
                        <p className="text-[12px] font-bold text-slate-900">{titleLine}</p>
                        {desc && <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{desc}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Formação Académica */}
              <section className="space-y-3">
                <h3
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1"
                  style={{ borderColor: accent.hex }}
                >
                  <BookOpen className="size-3.5" style={{ color: accent.hex }} />
                  Formação Académica
                </h3>
                <div className="space-y-3">
                  {displayEducation.map((edu, idx) => {
                    const lines = edu.split("\n").filter(Boolean);
                    const titleLine = lines[0] || edu;
                    const desc = lines.slice(1).join(" ");
                    return (
                      <div key={idx} className="relative pl-3 border-l-2 border-slate-300">
                        <p className="text-[12px] font-bold text-slate-900">{titleLine}</p>
                        {desc && <p className="mt-0.5 text-[11px] text-slate-600">{desc}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Projectos e Referências (se preenchidos) */}
              {data.projects && data.projects.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
                    Projectos de Destaque
                  </h3>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1">
                    {data.projects.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </section>
              )}

              {data.references && data.references.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
                    Referências
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-700">
                    {data.references.map((ref, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/70">
                        {ref}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TEMPLATE 2: CLÁSSICO EXECUTIVO (1 COLUNA / PADRÃO ATS ELEGANTE)     */}
      {/* ==================================================================== */}
      {template === "classic" && (
        <div className="p-10 flex flex-col justify-between min-h-[297mm] space-y-6">
          <div className="space-y-6">
            {/* Cabeçalho Centralizado com Foto Opcional */}
            <header className="text-center space-y-2 border-b-2 pb-5" style={{ borderColor: accent.hex }}>
              {data.photoUrl && (
                <div className="mx-auto mb-2 relative size-16 rounded-full overflow-hidden border-2 shadow-sm" style={{ borderColor: accent.hex }}>
                  <img src={data.photoUrl} alt={data.fullName} className="size-full object-cover" />
                </div>
              )}
              <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 font-display">
                {data.fullName}
              </h1>
              <p className="text-sm font-semibold tracking-widest uppercase text-slate-600">
                {data.headline}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 font-medium">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>• {data.phone}</span>}
                {data.location && <span>• {data.location}</span>}
                {data.linkedin && <span>• {data.linkedin}</span>}
              </div>
            </header>

            {/* Perfil */}
            <section className="space-y-1.5">
              <h3
                className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b"
                style={{ color: accent.hex, borderColor: accent.hex }}
              >
                Perfil Profissional
              </h3>
              <p className="text-[11.5px] leading-relaxed text-slate-800 text-justify">
                {displayProfile}
              </p>
            </section>

            {/* Experiência */}
            <section className="space-y-3">
              <h3
                className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b"
                style={{ color: accent.hex, borderColor: accent.hex }}
              >
                Experiência Profissional
              </h3>
              <div className="space-y-3.5">
                {displayExperience.map((exp, idx) => {
                  const lines = exp.split("\n").filter(Boolean);
                  const title = lines[0] || exp;
                  const desc = lines.slice(1).join(" ");
                  return (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-[12px] font-bold text-slate-900">{title}</p>
                      {desc && <p className="text-[11px] leading-relaxed text-slate-700 pl-2">{desc}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Formação Académica */}
            <section className="space-y-3">
              <h3
                className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b"
                style={{ color: accent.hex, borderColor: accent.hex }}
              >
                Formação Académica
              </h3>
              <div className="space-y-2">
                {displayEducation.map((edu, idx) => (
                  <p key={idx} className="text-[11.5px] font-medium text-slate-800">
                    • {edu}
                  </p>
                ))}
              </div>
            </section>

            {/* Competências & Idiomas */}
            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3
                  className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b"
                  style={{ color: accent.hex, borderColor: accent.hex }}
                >
                  Competências
                </h3>
                <ul className="text-[11px] text-slate-800 space-y-1">
                  {displaySkills.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-slate-400" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3
                  className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b"
                  style={{ color: accent.hex, borderColor: accent.hex }}
                >
                  Idiomas & Detalhes
                </h3>
                <ul className="text-[11px] text-slate-800 space-y-1">
                  {displayLanguages.map((l, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-slate-400" />
                      <span>{l}</span>
                    </li>
                  ))}
                  {data.biNumber && <li>• {idLabel}: {data.biNumber}</li>}
                  {data.nuitNumber && <li>• {taxLabel}: {data.nuitNumber}</li>}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TEMPLATE 3: MINIMALISTA (ESTILO SUIÇO / CLEAN WHITESPACE)           */}
      {/* ==================================================================== */}
      {template === "minimal" && (
        <div className="p-12 flex flex-col justify-between min-h-[297mm] space-y-8">
          <div className="space-y-8">
            <header className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 font-display">
                {data.fullName}
              </h1>
              <p className="text-sm font-semibold tracking-wide text-slate-500">
                {data.headline}
              </p>
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.location && <span>{data.location}</span>}
                {data.linkedin && <span>{data.linkedin}</span>}
              </div>
            </header>

            <section className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Sobre
                </span>
              </div>
              <div className="col-span-9">
                <p className="text-[11.5px] leading-relaxed text-slate-700">
                  {displayProfile}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-6">
              <div className="col-span-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Experiência
                </span>
              </div>
              <div className="col-span-9 space-y-4">
                {displayExperience.map((exp, idx) => {
                  const lines = exp.split("\n").filter(Boolean);
                  const title = lines[0] || exp;
                  const desc = lines.slice(1).join(" ");
                  return (
                    <div key={idx} className="space-y-1">
                      <p className="text-[12px] font-bold text-slate-900">{title}</p>
                      {desc && <p className="text-[11px] leading-relaxed text-slate-600">{desc}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-6">
              <div className="col-span-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Educação
                </span>
              </div>
              <div className="col-span-9 space-y-2">
                {displayEducation.map((edu, idx) => (
                  <p key={idx} className="text-[11.5px] font-medium text-slate-800">
                    {edu}
                  </p>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-6">
              <div className="col-span-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Skills
                </span>
              </div>
              <div className="col-span-9 flex flex-wrap gap-2">
                {displaySkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TEMPLATE 4: BOLD / DESTAQUE (CABEÇALHO COM GRADIENTE & CARTOES)      */}
      {/* ==================================================================== */}
      {template === "bold" && (
        <div className="min-h-[297mm] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header com Faixa de Cor e Foto Opcional */}
            <header className="p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ backgroundColor: accent.hex }}>
              <div className="space-y-1 flex-1">
                <h1 className="text-3xl font-extrabold font-display tracking-tight">{data.fullName}</h1>
                <p className="mt-1 text-sm font-medium tracking-wide opacity-90">{data.headline}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-[11px] opacity-85">
                  {data.email && <span>{data.email}</span>}
                  {data.phone && <span>• {data.phone}</span>}
                  {data.location && <span>• {data.location}</span>}
                </div>
              </div>
              {data.photoUrl && (
                <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl shrink-0">
                  <img src={data.photoUrl} alt={data.fullName} className="size-full object-cover" />
                </div>
              )}
            </header>

            <div className="px-8 space-y-6">
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2" style={{ borderColor: accent.hex }}>
                  Resumo
                </h3>
                <p className="text-[11.5px] leading-relaxed text-slate-700">{displayProfile}</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2" style={{ borderColor: accent.hex }}>
                  Percurso Profissional
                </h3>
                <div className="space-y-3">
                  {displayExperience.map((exp, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60">
                      <p className="text-[12px] font-bold text-slate-900">{exp.split("\n")[0]}</p>
                      {exp.split("\n").slice(1).length > 0 && (
                        <p className="mt-1 text-[11px] text-slate-600">{exp.split("\n").slice(1).join(" ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2" style={{ borderColor: accent.hex }}>
                  Formação & Habilidades
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    {displayEducation.map((edu, idx) => (
                      <p key={idx} className="text-[11px] font-medium text-slate-800">• {edu}</p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {displaySkills.map((s, idx) => (
                      <span key={idx} className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
