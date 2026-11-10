import { Link, useLocation, useNavigate } from "react-router";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle("Page not found");

  return (
    <Card>
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description={`Nothing lives at ${location.pathname}.`}
        action={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go back
            </Button>
            <Link to="/" className={buttonClasses()}>
              Dashboard
            </Link>
          </div>
        }
      />
    </Card>
  );
}
