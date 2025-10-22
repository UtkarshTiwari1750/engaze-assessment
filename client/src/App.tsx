import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

function App() {
  const { isAuthenticated, getCurrentUser } = useAuth();

  // Initialize user on app load if token exists
  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated, getCurrentUser]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
