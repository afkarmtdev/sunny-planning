import type { StyleXStyles } from "@stylexjs/stylex";
import { useApp } from "../store/useApp";
import { Avatar } from "./Avatar";

type Props = {
  /** The acting member's id (a record's `createdBy` audit field). */
  by?: string;
  size?: number;
  xstyle?: StyleXStyles;
};

/**
 * A small avatar for the member who created a record, resolved from the synced
 * space roster (`members`). Renders nothing when there is no member to show:
 * demo mode has an empty roster, and records created before auth stamping carry
 * no `createdBy`, so the chip is safe to drop on any card without a fallback.
 */
export function AuthorChip({ by, size = 18, xstyle }: Props) {
  const member = useApp((s) => (by ? s.members.find((m) => m.userId === by) : undefined));
  if (!member) return null;
  return (
    <Avatar
      initial={member.initial}
      color={member.color}
      photoUrl={member.avatarUrl}
      size={size}
      xstyle={xstyle}
    />
  );
}
