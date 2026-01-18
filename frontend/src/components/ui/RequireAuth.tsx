import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/ui/auth-context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { setToken } = useContext(AuthContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if we're authenticated by making a test API call
    // If not authenticated, OAuth2-Proxy will redirect to login automatically
    fetch('/api/recents?count=1')
      .then(response => {
        if (response.ok) {
          setToken("authenticated"); // Set a dummy token to indicate authenticated
          setIsChecking(false);
        } else if (response.status === 401) {
          // OAuth2-Proxy will handle the redirect to /oauth2/start
          window.location.href = '/oauth2/start';
        } else {
          setIsChecking(false);
        }
      })
      .catch(() => {
        setIsChecking(false);
      });
  }, [setToken]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
        <h2>Checking authentication...</h2>
      </div>
    );
  }

  return <>{children}</>;
}
