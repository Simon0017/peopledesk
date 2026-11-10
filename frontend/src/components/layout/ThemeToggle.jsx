import { Monitor, Moon, Sun } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useUiStore } from "@/stores/uiStore";

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const CurrentIcon = THEME_ICONS[theme];

  return (
    <Dropdown label="Change theme" triggerSize="icon" triggerContent={<CurrentIcon className="h-5 w-5" aria-hidden="true" />}>
      <DropdownItem icon={Sun} onSelect={() => setTheme("light")}>Light</DropdownItem>
      <DropdownItem icon={Moon} onSelect={() => setTheme("dark")}>Dark</DropdownItem>
      <DropdownItem icon={Monitor} onSelect={() => setTheme("system")}>System</DropdownItem>
    </Dropdown>
  );
}
