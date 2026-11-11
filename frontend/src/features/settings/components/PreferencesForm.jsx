import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { useUiStore } from "@/stores/uiStore";

const THEME_CHOICES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];
const DENSITY_CHOICES = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

function ChoiceGroup({ legend, name, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map(({ value: optionValue, label, icon: Icon }) => (
          <label
            key={optionValue}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm has-focus-visible:outline-2 has-focus-visible:outline-indigo-600",
              value === optionValue ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-line hover:bg-surface-muted",
            )}
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="sr-only"
            />
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PreferencesForm() {
  const theme = useUiStore((state) => state.theme);
  const density = useUiStore((state) => state.density);
  const pageSize = useUiStore((state) => state.pageSize);
  const setTheme = useUiStore((state) => state.setTheme);
  const setDensity = useUiStore((state) => state.setDensity);
  const setPageSize = useUiStore((state) => state.setPageSize);

  return (
    <div className="max-w-xl space-y-6 p-6">
      <p className="text-sm text-fg-muted">Preferences are saved on this device and apply instantly.</p>
      <ChoiceGroup legend="Theme" name="theme" value={theme} options={THEME_CHOICES} onChange={setTheme} />
      <ChoiceGroup legend="Table density" name="density" value={density} options={DENSITY_CHOICES} onChange={setDensity} />
      <label className="block max-w-xs">
        <span className="text-sm font-medium">Default rows per page</span>
        <select
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          className="mt-2 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
