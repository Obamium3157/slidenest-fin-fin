import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PresentationMaker } from "../pages/presentation/ui/PresentationMaker.tsx";
import {
  maxPresentation,
  // minPresentation,
} from "../entities/presentation/model/test/data.ts";

const pair = maxPresentation();
// const pair = minPresentation();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PresentationMaker presentation={pair.presentation} select={pair.select} />
  </StrictMode>,
);
