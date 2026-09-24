import { useMemo, useEffect } from "react";
import { getFilePresentation } from "@/utils/utils";

export function MessageFilePreview({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/");
  const imageUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : undefined),
    [file, isImage],
  );

  useEffect(() => {
    if (imageUrl) {
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [imageUrl]);

  if (isImage && imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={file.name}
        className="max-h-80 max-w-full rounded-xl object-contain"
      />
    );
  }

  const { icon: FileIcon, colorClassName } = getFilePresentation(file);

  return (
    <div className="flex max-w-64 items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2">
      <FileIcon
        className={`h-6 w-6 shrink-0 ${colorClassName}`}
        aria-hidden="true"
      />
      <span className="min-w-0 truncate text-sm font-medium" title={file.name}>
        {file.name}
      </span>
    </div>
  );
}
