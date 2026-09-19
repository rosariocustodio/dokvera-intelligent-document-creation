import React from "react";
import { X, Eye, FileText, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { type DocSpec } from "@/lib/document-specs";
import { DocumentSkeletonPreview } from "./DocumentSkeletonPreview";
import { CvLivePreview, extractCvDataFromFields, type CvAccentColor } from "@/components/cv";

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
      <DrawerContent className="max-h-[92vh] h-[92vh] flex flex-col bg-background rounded-t-3xl border-t border-border/70">
        {/* Sheet Header */}
        <DrawerHeader className="border-b border-border/50 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            <div>
              <DrawerTitle className="text-xs font-bold font-display text-foreground">
                Pré-visualização A4 em Tempo Real
              </DrawerTitle>
              <p className="text-[10px] text-muted-foreground">{spec.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                title="Diminuir Zoom"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                title="Aumentar Zoom"
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>

            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-xl">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Sheet Content Body with Scroll & Pinch Zoom Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20 flex flex-col items-center">
          <div
            className="w-full transition-transform duration-200 origin-top"
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
