import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RequireAuth } from "@/components/ui/RequireAuth";

// Component that processes share data after authentication is confirmed
function AuthenticatedShareProcessor() {
  const navigate = useNavigate();

  useEffect(() => {
    // Process share data from query parameters - this only runs when authenticated
    if (window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const url = params.get("text");
      const title = params.get("title");
      
      if (url) {
        let target = `/show/${encodeURIComponent(url)}`;
        if (title) {
          target = `${target}?titleHint=${encodeURIComponent(title)}`;
        }
        navigate(target, { replace: true });
        return;
      }
    }

    // If no valid share data, redirect to main page
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div style={{ padding: "2em", textAlign: "center" }}>
      <h2>Processing shared link…</h2>
      <p>If this message doesn't go away, show it to Richard.</p>
      <p>The url received was {window.location.href}</p>
    </div>
  );
}

// This component acts as a PWA share target. It handles authentication and
// processes shared URLs, redirecting to the ShowPage for display.
export default function ShareTarget() {
  return (
    <RequireAuth>
      <AuthenticatedShareProcessor />
    </RequireAuth>
  );
}
