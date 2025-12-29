import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../entities/store";
import { UserProvider } from "../auth";
import { AppRoutes } from "./router/AppRoutes";
import { startAutosaveTimer } from "../entities/store/autosaveTimer.ts";

store.dispatch(startAutosaveTimer());

const root = createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </Provider>
  </BrowserRouter>,
);
