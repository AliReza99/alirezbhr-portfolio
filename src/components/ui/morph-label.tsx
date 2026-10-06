type MorphLabelProps = {
  children: string;
  /** The ink-filled copy inside the Copy button is visible, so it must not be aria-hidden. */
  hideCursive?: boolean;
};

/** Sans label that wipes into Caveat handwriting when its link or button is hovered. */
export const MorphLabel = ({ children, hideCursive = true }: MorphLabelProps) => (
  <span data-morph="">
    <span data-ms="">{children}</span>
    <span data-mc="" aria-hidden={hideCursive || undefined}>
      {children}
    </span>
  </span>
);
