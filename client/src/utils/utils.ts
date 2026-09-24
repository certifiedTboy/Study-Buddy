import {
  Archive,
  File as GenericFileIcon,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
  type LucideIcon,
} from "lucide-react";

import { twMerge } from "tailwind-merge";

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FilePresentation = {
  icon: LucideIcon;
  colorClassName: string;
};

export function getFilePresentation(file: File): FilePresentation {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf" || file.type === "application/pdf") {
    return { icon: FileText, colorClassName: "text-red-500" };
  }

  if (
    ["ppt", "pptx", "odp"].includes(extension ?? "") ||
    file.type.includes("presentation")
  ) {
    return { icon: Presentation, colorClassName: "text-orange-500" };
  }

  if (
    ["doc", "docx", "odt", "rtf"].includes(extension ?? "") ||
    file.type.includes("word") ||
    file.type.includes("document")
  ) {
    return { icon: FileText, colorClassName: "text-blue-500" };
  }

  if (["xls", "xlsx", "ods", "csv"].includes(extension ?? "")) {
    return { icon: FileSpreadsheet, colorClassName: "text-green-600" };
  }

  if (["txt", "log"].includes(extension ?? "") || file.type === "text/plain") {
    return { icon: FileText, colorClassName: "text-slate-500" };
  }

  if (file.type.startsWith("image/")) {
    return { icon: FileImage, colorClassName: "text-purple-500" };
  }

  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(extension ?? "") ||
    file.type.includes("compressed")
  ) {
    return { icon: Archive, colorClassName: "text-amber-500" };
  }

  if (
    ["js", "jsx", "ts", "tsx", "json", "html", "css", "py"].includes(
      extension ?? "",
    ) ||
    file.type.includes("javascript") ||
    file.type.includes("json")
  ) {
    return { icon: FileCode2, colorClassName: "text-violet-500" };
  }

  return { icon: GenericFileIcon, colorClassName: "text-muted-foreground" };
}
