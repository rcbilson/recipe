import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RequireAuth } from "@/components/ui/RequireAuth";

// Returns the first http(s) url found in the given text, or null.
function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/\S+/);
  if (!match) {
    return null;
  }
  try {
    new URL(match[0]);
    return match[0];
  } catch {
    return null;
  }
}

// Component that processes share data after authentication is confirmed
function AuthenticatedShareProcessor() {
  const navigate = useNavigate();

  useEffect(() => {
    // Process share data from query parameters - this only runs when authenticated
    if (window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      // Some apps share the url in "text" along with other words (e.g.
      // "Recipe Title https://..."), so pull the url out of whichever
      // param contains one.
      let url: string | null = null;
      let title = params.get("title");
      for (const name of ["url", "text", "title"]) {
        const value = params.get(name);
        const candidate = value ? extractUrl(value) : null;
        if (candidate) {
          url = candidate;
          if (name === "text" && !title) {
            const rest = value!.replace(candidate, "").trim();
            if (rest) {
              title = rest;
            }
          }
          break;
        }
      }

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
