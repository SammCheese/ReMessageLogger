import type { Moment } from "moment"

interface ISO8601 {
  milliseconds: () => ISO8601;
  _isAMomentObject: boolean;
}

interface stylesType {
  edited: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TimestampType {
  timestamp: Moment;
  isEdited?: boolean;

  className?: string;
  id?: string;

  cozyAlt?: boolean;
  compact?: boolean;
  isInline?: boolean;
  isVisibleOnlyOnHover?: boolean;
}

