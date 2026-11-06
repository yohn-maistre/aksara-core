import type { ReactNode } from "react";
import {
  Button,
  Input,
  Select,
  type ButtonProps,
  type InputProps,
} from "twenty-ui/primitives/input";
import { ThemeProvider } from "twenty-ui/theme";
import { useWorkspace } from "./state";
export function WorkspaceTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useWorkspace();
  return (
    <ThemeProvider
      colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
      className="aksara-ui"
    >
      {children}
    </ThemeProvider>
  );
}
export function ActionButton({ className, ...props }: ButtonProps) {
  return <Button className={`twenty-button ${className || ""}`} {...props} />;
}
export function AppInput({ className, ...props }: InputProps) {
  return <Input className={`app-input ${className || ""}`} {...props} />;
}
export function AppSelect({
  value,
  onChange,
  options,
  label,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  disabled?: boolean;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(v) => {
        if (typeof v === "string") onChange(v);
      }}
      items={options}
      disabled={disabled}
    >
      <Select.Trigger aria-label={label} className="app-select">
        <Select.Value placeholder="Choose…" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} className="app-select-positioner">
          <Select.Popup className="app-select-popup">
            <Select.List>
              {options.map((o) => (
                <Select.Item value={o.value} key={o.value}>
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
