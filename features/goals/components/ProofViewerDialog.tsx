"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getProof } from "@/features/goals/lib/proof-db";


interface ProofViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofId: string | null;
  filename?: string | null;
  mimeType?: string | null;
}

export default function ProofViewerDialog({
  open,
  onOpenChange,
  proofId,
  filename,
  mimeType,
}: ProofViewerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPdf = useMemo(() => (mimeType ?? "").toLowerCase() === "application/pdf", [mimeType]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!open || !proofId) return;

      setLoading(true);
      setError(null);
      setUrl(null);

      try {
        const rec = await getProof(proofId);
        if (!active) return;

        if (!rec) {
          setError("Proof file not found (maybe cleared from browser storage).");
          return;
        }

        const objectUrl = URL.createObjectURL(rec.blob);
        setUrl(objectUrl);
      } catch (e) {
        setError("Could not load proof.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, proofId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Proof</DialogTitle>
          <DialogDescription className="truncate">
            {filename ?? "Attachment"}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3">
          {loading && (
            <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
                Loading proof...
            </div>
            )}


          {!loading && error && (
            <div className="text-sm text-muted-foreground">{error}</div>
          )}

          {!loading && !error && url && (
            <>
              {isPdf ? (
                <iframe
                  src={url}
                  title="Proof PDF"
                  className="h-[70vh] w-full rounded-md bg-background"
                />
              ) : (
                // image preview
                <img
                  src={url}
                  alt={filename ?? "Proof image"}
                  className="max-h-[70vh] w-full rounded-md object-contain bg-background"
                />
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {url && (
            <Button asChild>
              <a href={url} download={filename ?? "proof"}>
                Download
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
