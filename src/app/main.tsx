import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../entities/store";
import { PresentationMaker } from "../pages/presentation/ui/PresentationMaker.tsx";
import { UserProvider } from "../auth";
import { AuthGate } from "../pages/auth/ui/AuthGate/AuthGate.tsx";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <UserProvider>
      <AuthGate>
        <PresentationMaker />
      </AuthGate>
    </UserProvider>
  </Provider>,
);
