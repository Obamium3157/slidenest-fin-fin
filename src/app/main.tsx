import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../entities/store";
import { UserProvider } from "../auth";
import { AuthGate } from "../pages/auth/ui/AuthGate/AuthGate";
import { AppRoutes } from "./router/AppRoutes";

const root = createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <UserProvider>
        <AuthGate>
          <AppRoutes />
        </AuthGate>
      </UserProvider>
    </Provider>
  </BrowserRouter>,
);
