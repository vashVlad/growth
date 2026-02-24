"use client"

import { useRef, useState } from "react"
import { CheckCircle2, FileUp, Paperclip, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface CompleteGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalStatement: string
  onComplete: (file: File | null, note: string) => void
}

export default function CompleteGoalDialog({
  open,
  onOpenChange,
  goalStatement,
  onComplete,
}: CompleteGoalDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files?.[0] ?? null
    if (dropped) {
      const allowed = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        "application/pdf",
      ]
      if (allowed.includes(dropped.type)) {
        setFile(dropped)
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleRemoveFile() {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleSubmit() {
    onComplete(file, note)
    setFile(null)
    setNote("")
    onOpenChange(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFile(null)
      setNote("")
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Goal</DialogTitle>
          <DialogDescription className="text-pretty">
            Mark &ldquo;{goalStatement}&rdquo; as done. Optionally attach proof
            and add a note.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* File upload */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="proof-upload" className="text-sm font-medium">
              Proof of completion
            </Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <FileUp className="size-8 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">
                  Drop a file here or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Images and PDF accepted
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="proof-upload"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {file && (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={handleRemoveFile}
                  aria-label="Remove file"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Note textarea */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="completion-note" className="text-sm font-medium">
              Note{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="completion-note"
              placeholder="What did you accomplish?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <CheckCircle2 className="size-4" />
            Mark completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
