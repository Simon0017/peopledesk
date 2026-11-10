import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/feedback/useToast";

export default function DashboardPage() {
  const toast = useToast();
  return <Button onClick={() => toast.success("Saved!")}>Toast</Button>;
}
