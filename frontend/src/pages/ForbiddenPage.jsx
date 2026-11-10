import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ForbiddenPage() {
  useDocumentTitle("Access denied");

  return (
    <Card>
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="Ask an administrator if you think you should."
        action={
          <Link to="/" className={buttonClasses({ variant: "secondary" })}>
            Back to dashboard
          </Link>
        }
      />
    </Card>
  );
}
