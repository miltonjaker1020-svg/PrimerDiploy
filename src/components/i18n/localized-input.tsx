"use client";
import type { ComponentProps } from "react";
import { useLanguage } from "./language-provider";

export default function LocalizedInput(props: ComponentProps<"input">) {
  const { t } = useLanguage();
  return <input {...props} placeholder={props.placeholder ? t(props.placeholder) : undefined} aria-label={props["aria-label"] ? t(props["aria-label"]) : undefined} />;
}
