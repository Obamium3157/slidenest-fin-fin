import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../entities/store";
import { PresentationMaker } from "../pages/presentation/ui/PresentationMaker.tsx";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <PresentationMaker />
  </Provider>,
);
