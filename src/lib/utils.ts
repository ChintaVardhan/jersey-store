import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function editionLabel(edition: string) {
  switch (edition) {
    case "FAN_EDITION":
      return "Fan Edition";
    case "MASTER_COPY":
      return "Master Copy";
    case "CUSTOM_BUILD":
      return "Custom Build";
    default:
      return edition;
  }
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parseImageColors(value: string): {
  primary: string;
  secondary: string;
  accent: string;
} {
  try {
    const parsed = JSON.parse(value);
    return {
      primary: parsed.primary ?? "#111",
      secondary: parsed.secondary ?? "#fff",
      accent: parsed.accent ?? "#C6FF3D",
    };
  } catch {
    return { primary: "#111", secondary: "#fff", accent: "#C6FF3D" };
  }
}
