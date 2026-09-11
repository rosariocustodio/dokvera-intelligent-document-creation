import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      q: "O Dokvera substitui o Microsoft Word ou Google Docs?",
      a: "O Dokvera foi concebido para eliminar o trabalho mais difícil: começar do zero, estruturar o raciocínio e redigir com rigor técnico. Depois de aperfeiçoar o seu documento na nossa plataforma, você pode exportá-lo diretamente para Microsoft Word (.docx) 100% editável ou PDF de alta resolução.",
    },
    {
      q: "Como funciona a geração de documentos com inteligência artificial?",
      a: "Diferente de chatbots comuns que produzem apenas mensagens de chat, o motor do Dokvera constrói uma arquitetura documental completa. Ele cria índice navegável, divide o trabalho em capítulos coerentes, aplica o vocabulário formal adequado e formata tabelas e callouts prontos para uso profissional.",
    },
    {
      q: "Posso editar o documento após a sua geração?",
      a: "Sim, absolutamente. O Dokvera possui um editor integrado onde você pode editar qualquer palavra, adicionar ou remover seções, reordenar capítulos e utilizar a barra de IA contextual para reescrever ou expandir parágrafos específicos.",
    },
    {
      q: "Em que formatos posso exportar os documentos finalizados?",
      a: "Pode exportar em formato Microsoft Word (.docx) nativo — mantendo títulos, tabelas, formatações e recuos perfeitos — ou em PDF de alta qualidade, ideal para envio formal por e-mail, assinatura digital ou impressão.",
    },
    {
      q: "Preciso de pagar ou introduzir cartão de crédito para testar?",
      a: "Não. Ao criar a sua conta gratuita, recebe imediatamente créditos de boas-vindas para criar, editar e exportar os seus primeiros documentos sem qualquer custo ou compromisso.",
    },
    {
      q: "Os meus dados, pesquisas e rascunhos estão seguros?",
      a: "Totalmente. Adotamos isolamento estrito de dados por utilizador (Row-Level Security no PostgreSQL). Apenas você tem acesso aos seus documentos gerados, rascunhos salvos e histórico de exportações.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-background scroll-mt-20">
      <div className="mx-auto max-w-4xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <HelpCircle className="size-3 text-primary" />
            <span>Perguntas Frequentes</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight">
            Tudo o que precisa de saber
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Respostas transparentes sobre o funcionamento, exportação e segurança do Dokvera.
          </p>
        </div>

        {/* Accordion Component */}
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="rounded-2xl border border-border/80 bg-card px-5 shadow-2xs"
              >
                <AccordionTrigger className="text-left text-sm font-bold hover:no-underline py-4.5 text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4.5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
