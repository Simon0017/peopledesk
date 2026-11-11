import { Outlet } from "react-router";
import { Logo } from "./Logo";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
