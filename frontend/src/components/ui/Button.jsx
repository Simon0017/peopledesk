import { buttonClasses } from "./buttonStyles";
import { Spinner } from "./Spinner";

/**
 * The app's only button. Variants keep styling consistent; `...props` forwards
 * everything else (onClick, aria-*, form, ref...) to the native <button>.
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button", // default to "button" so buttons inside forms don't submit by accident
  isLoading = false,
  leftIcon: LeftIcon, // rename on destructure: components must be capitalised to render
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {isLoading ? <Spinner className="h-4 w-4" /> : LeftIcon && <LeftIcon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
