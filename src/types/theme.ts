export type ThemePresetId =
  | "wedding"
  | "christmas"
  | "halloween"
  | "birthday"
  | "party"
  | "corporate"
  | "baby_shower"
  | "graduation"
  | "anniversary"
  | "custom";

export type LayoutStyle = "centered" | "wide" | "card" | "fullscreen" | "split";
export type BackgroundType = "solid" | "gradient" | "image" | "pattern";
export type AnimationStyle = "none" | "subtle" | "festive";

export interface ThemeConfig {
  presetId: ThemePresetId;
  presetName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    button: string;
    buttonText: string;
    card: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
    headingWeight: number;
    bodyWeight: number;
  };
  layout: LayoutStyle;
  background: {
    type: BackgroundType;
    value: string;
    secondary?: string;
    imageUrl?: string;
  };
  decorations: {
    ornaments: boolean;
    animation: AnimationStyle;
  };
  cardStyle: {
    radius: number;
    shadow: "none" | "soft" | "lifted";
    border: boolean;
  };
  buttonStyle: {
    radius: number;
    shadow: boolean;
  };
}

export interface BrandingAssets {
  logoUrl?: string;
  hostImageUrl?: string;
  coverImageUrl?: string;
  iconUrl?: string;
}
