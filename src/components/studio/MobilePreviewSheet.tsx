import React from "react";
import { X, Eye, FileText, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { type DocSpec } from "@/lib/document-specs";
import { DocumentSkeletonPreview } from "./DocumentSkeletonPreview";
import { CvLivePreview, extractCvDataFromFields, type CvAccentColor } from "@/components/cv";
import { cn } from "@/lib/utils";

interface MobilePreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spec: DocSpec;
  fields: Record<string, unknown>;
  structure: string[];
  pageTierId?: string;
  templateId?: string;
  cvAccent?: CvAccentColor;
  instructions?: string;
  title: string;
  country?: string;
}

export function MobilePreviewSheet({
  open,
  onOpenChange,
  spec,
  fields,
  structure,
  pageTierId,
  templateId,
  cvAccent = "indigo",
  instructions,
  title,
  country,
}: MobilePreviewSheetProps) {
  const [zoom, setZoom] = React.useState(1);

  const cvData = React.useMemo(() => {
    return extractCvDataFromFields(fields, (fields.full_name as string) || "Seu Nome Completo");
  }, [fields]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[94vh] h-[94vh] flex flex-col bg-background rounded-t-[32px] border-t border-border/80 shadow-2xl">
        {/* Drag Handle & Header */}
        <DrawerHeader className="border-b border-border/60 px-5 py-3.5 flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-md rounded-t-[32px]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <FileText className="size-4" />
            </span>
            <div>
              <DrawerTitle className="text-xs font-bold font-display text-foreground text-left">
                Folha A4 em Tempo Real
              </DrawerTitle>
              <p className="text-[10px] font-mono text-muted-foreground text-left">{spec.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Presets */}
            <div className="flex items-center rounded-xl border border-border/80 bg-muted/50 p-1">
              {[0.8, 1, 1.2].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoom(z)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer",
                    zoom === z ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {Math.round(z * 100)}%
                </button>
              ))}
            </div>

            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-xl cursor-pointer">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Sheet Content Body with Scroll & Touch Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/30 flex flex-col items-center">
          <div
            className="w-full transition-transform duration-200 origin-top flex justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {spec.id === "cv" ? (
              <CvLivePreview
                data={cvData}
                template={templateId || "modern"}
                onSelectTemplate={() => {}}
                accentColor={cvAccent}
                onSelectAccent={() => {}}
                country={country}
              />
            ) : (
              <DocumentSkeletonPreview
                spec={spec}
                fields={fields}
                structure={structure}
                pageTierId={pageTierId}
                templateId={templateId}
                instructions={instructions}
                title={title}
              />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
