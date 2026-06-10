import {
  Package,
  Receipt,
  HelpCircle,
  CheckSquare,
  Lightbulb,
  Link,
  MessageSquareQuote,
  Ruler,
  Heart,
  AlertTriangle,
  Home,
  GitCompare,
  Gauge,
  FileText,
  type LucideIcon,
} from "lucide-react"

// Propstical Canvas — renovation domain remap.
// Underlying type IDs are inherited from the upstream Nodepad data model
// (claim / question / task / idea / entity / reference / quote / definition /
// opinion / reflection / narrative / comparison / thesis / general). We keep
// the IDs stable so serialisation + export formats stay compatible, but every
// user-facing label + icon is reframed for home-renovation decisions.
export type ContentType =
  | "entity"
  | "claim"
  | "question"
  | "task"
  | "idea"
  | "reference"
  | "quote"
  | "definition"
  | "opinion"
  | "reflection"
  | "narrative"
  | "comparison"
  | "thesis"
  | "general"

export interface ContentTypeConfig {
  label: string
  icon: LucideIcon
  accentVar: string
  bodyStyle?: "blockquote" | "italic" | "checkbox" | "confidence" | "muted-italic"
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  entity: {
    label: "Material",
    icon: Package,
    accentVar: "var(--type-entity)",
  },
  claim: {
    label: "Contractor Quote",
    icon: Receipt,
    accentVar: "var(--type-claim)",
    bodyStyle: "confidence",
  },
  question: {
    label: "Open Question",
    icon: HelpCircle,
    accentVar: "var(--type-question)",
  },
  task: {
    label: "To-do",
    icon: CheckSquare,
    accentVar: "var(--type-task)",
    bodyStyle: "checkbox",
  },
  idea: {
    label: "Inspiration",
    icon: Lightbulb,
    accentVar: "var(--type-idea)",
  },
  reference: {
    label: "Vendor / Link",
    icon: Link,
    accentVar: "var(--type-reference)",
  },
  quote: {
    label: "Expert Note",
    icon: MessageSquareQuote,
    accentVar: "var(--type-quote)",
    bodyStyle: "blockquote",
  },
  definition: {
    label: "Specification",
    icon: Ruler,
    accentVar: "var(--type-definition)",
    bodyStyle: "blockquote",
  },
  opinion: {
    label: "Preference",
    icon: Heart,
    accentVar: "var(--type-opinion)",
    bodyStyle: "italic",
  },
  reflection: {
    label: "Risk / Concern",
    icon: AlertTriangle,
    accentVar: "var(--type-reflection)",
    bodyStyle: "muted-italic",
  },
  narrative: {
    label: "Room Context",
    icon: Home,
    accentVar: "var(--type-narrative)",
  },
  comparison: {
    label: "Option Compare",
    icon: GitCompare,
    accentVar: "var(--type-comparison)",
  },
  general: {
    label: "Note",
    icon: FileText,
    accentVar: "var(--type-general)",
  },
  thesis: {
    label: "Decision Score",
    icon: Gauge,
    accentVar: "var(--thesis-accent)",
  },
}

export const ALL_CONTENT_TYPES = Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]
