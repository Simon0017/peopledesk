import { AppProviders } from "@/app/AppProviders";
import { AppRoutes } from "@/app/AppRoutes";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";

export default function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </AppProviders>
  );
}
