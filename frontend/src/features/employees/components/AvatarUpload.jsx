import { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

/**
 * A controlled file field for React Hook Form's <Controller>.
 * `value` is a File or null; `currentUrl` is the photo already saved on the server.
 */
export function AvatarUpload({ value, onChange, onBlur, currentUrl, name, error }) {
  const inputRef = useRef(null); // the real <input type="file"> is hidden; buttons click it
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState(null);

  // Object URLs hold the file in memory until revoked. Revoke the old one whenever it
  // changes and on unmount. (This effect is a no-op on mount, so Strict Mode is fine.)
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the user pick the same file again after removing it
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file)); // created in the EVENT, not in an effect
    onChange(file);
    onBlur?.(); // mark as touched so validation runs immediately
  }

  function handleRemove() {
    setPreviewUrl(null);
    onChange(null);
  }

  const displayedUrl = value ? previewUrl : currentUrl;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium">Profile photo</span>
      <div className="flex items-center gap-4">
        <Avatar src={displayedUrl} name={name} size="xl" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={Upload} onClick={() => inputRef.current?.click()}>
              {displayedUrl ? "Change photo" : "Upload photo"}
            </Button>
            {value && (
              <Button variant="ghost" size="sm" leftIcon={X} onClick={handleRemove}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-fg-muted">JPG, PNG or WEBP, up to 2 MB.</p>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Profile photo file"
          tabIndex={-1}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
