import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { PreferencesForm } from "../components/PreferencesForm";
import { ProfileForm } from "../components/ProfileForm";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
];
const TAB_IDS = TABS.map((tab) => tab.id);

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  // Never trust the URL: fall back to a known tab.
  const activeTab = TAB_IDS.includes(requestedTab) ? requestedTab : "profile";

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, password and preferences." />
      <Card>
        <div className="px-4">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={(tab) => setSearchParams({ tab }, { replace: true })} label="Settings sections" />
        </div>
        <div role="tabpanel">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "security" && <ChangePasswordForm />}
          {activeTab === "preferences" && <PreferencesForm />}
        </div>
      </Card>
    </>
  );
}
