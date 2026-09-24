import { CircleX } from "lucide-react";
import { getFilePresentation } from "@/utils/utils";

type FilePreviewProps = {
  file: File;
  onRemove: () => void;
};

function FilePreview({ file, onRemove }: FilePreviewProps) {
  const { icon: FileIcon, colorClassName } = getFilePresentation(file);

  return (
    <div className="mx-auto mb-2 flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <FileIcon
        className={`h-6 w-6 shrink-0 ${colorClassName}`}
        aria-hidden="true"
      />
      <span
        className="min-w-0 flex-1 truncate text-sm font-semibold"
        title={file.name}
      >
        {file.name}
      </span>
      <button
        type="button"
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        <CircleX size={15} />
      </button>
    </div>
  );
}

export default FilePreview;
