import createElement from "./createElement.js";
import modal from "../components/modal.js";

export default function renderTierLimitWarning(message) {
  modal.show(
    createElement("div", { class: "modal-pro-warning-container" }, [
      createElement("h2", {}, "Limited Feature"),
      createElement("hr", { style: "margin-top: 0px;" }),
      createElement("div", {}, message),
      createElement("br"),
      createElement("div", {}, "Thank you."),
      createElement("br"),
      createElement("small", {}, "-- the Far Reach Co. staff"),
    ])
  );
}
