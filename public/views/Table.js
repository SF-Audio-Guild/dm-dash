import state from "../lib/state.js";
import createElement from "../lib/createElement.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import accountManager from "../lib/AccountManager.js"; // dont remove
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/TableSidebar.js";
import CanvasLayer from "../components/CanvasLayer.js";
import socketIntegration from "../lib/socketIntegration.js";
import TableSidebarComponent from "../lib/TableSidebarComponent.js";
import modal from "../components/modal.js";

class Table {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";
    this.params = props.params;

    this.canvasLayer;

    this.init();
  }

  init = async () => {
    // get table views
    this.projectId = localStorage.getItem("current-table-project-id");
    const project = await getThings(`/api/get_project/${this.projectId}`);
    state.currentProject = project;
    const tableViews = await getThings(
      `/api/get_table_views/${state.currentProject.id}`
    );
    // sidebar and hamburger inst
    this.instantiateSidebar();
    this.instantiateHamburger();
    // create canvas elem and append
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });
    this.canvasLayer = new CanvasLayer({
      tableViews,
      tableSidebarComponent: this.tableSidebarComponent,
    });
    socketIntegration.projectId = this.projectId;
    // setup socket listeners after canvas instantiation
    socketIntegration.socketTest();
    socketIntegration.setupListeners(this.canvasLayer);

    this.render();
    this.canvasLayer.init();
  };

  instantiateSidebar = () => {
    const tableSidebarComponent = new TableSidebarComponent({
      domComponent: createElement("div", {
        style: "display: flex; flex-direction: column;",
      }),
    });
    // SIDEBAR
    const sidebar = new TableSidebar({
      domComponent: createElement("div", {}),
      tableSidebarComponent,
    });
    this.sidebar = sidebar;
    this.tableSidebarComponent = tableSidebarComponent;
  };

  instantiateHamburger = () => {
    const hamburgerElem = createElement("div", {});
    // SIDEBAR
    const hamburger = new Hamburger({
      domComponent: hamburgerElem,
      sidebar: this.sidebar,
    });
    this.hamburger = hamburger;
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(
      this.sidebar.domComponent,
      this.hamburger.domComponent
    );
    this.sidebar.render();
    this.hamburger.render();
  };

  render = async () => {
    this.renderSidebarAndHamburger();

    const topLayerElem = createElement("div");
    new TopLayer({
      domComponent: topLayerElem,
      canvasLayer: this.canvasLayer,
    });

    this.domComponent.append(
      createElement("div", { style: "position: relative;" }, [
        topLayerElem,
        this.canvasElem,
      ])
    );
  };
}

class TopLayer {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.canvasLayer = props.canvasLayer;
    this.render();
  }

  handleChangeCanvasLayer = () => {
    const gridObjectIndex = this.canvasLayer.canvas
      .getObjects()
      .indexOf(this.canvasLayer.oGridGroup);

    if (this.canvasLayer.currentLayer === "Map") {
      this.canvasLayer.currentLayer = "Object";
      this.canvasLayer.canvas.getObjects().forEach((object, index) => {
        if (object.layer === "Map") {
          object.selectable = false;
          object.evented = false;
        }
        if (object.layer === "Object") {
          object.selectable = true;
          object.evented = true;
          object.opacity = "1";
        }
        this.canvasLayer.canvas.renderAll();
      });
    } else {
      this.canvasLayer.currentLayer = "Map";
      this.canvasLayer.canvas.getObjects().forEach((object, index) => {
        if (object.layer === "Map") {
          object.selectable = true;
          object.evented = true;
        }
        if (object.layer === "Object") {
          object.selectable = false;
          object.evented = false;
          object.opacity = "0.5";
        }
        this.canvasLayer.canvas.renderAll();
      });
    }
    this.render();
  };

  renderLayersElem = () => {
    if (state.currentProject.is_editor === false) {
      return createElement("div", { style: "display: none;" });
    } else {
      return createElement("div", { class: "table-config layers-elem" }, [
        createElement(
          "small",
          {},
          `Current Layer: ${this.canvasLayer.currentLayer}`
        ),
        createElement(
          "button",
          {},
          `View ${
            this.canvasLayer.currentLayer === "Map" ? "Object" : "Map"
          } Layer`,
          {
            type: "click",
            event: () => this.handleChangeCanvasLayer(),
          }
        ),
      ]);
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      this.renderLayersElem(),
      createElement(
        "div",
        { class: "table-config info-elem" },
        [createElement("div", {}, "?")],
        {
          type: "click",
          event: () => {
            modal.show(
              createElement("div", { class: "help-content" }, [
                createElement("h1", {}, "Key Commands"),
                createElement("hr"),
                createElement("b", {}, "Option/Alt (⌥)"),
                createElement(
                  "small",
                  {},
                  "Hold key to enable multi-select. While holding key, hold click and drag cursor to select multiple objects within the boxed region."
                ),
                createElement("br"),
                createElement("b", {}, "Control (⌃)"),
                createElement(
                  "small",
                  {},
                  "While an object is selected, pressing control will change the layer that the object is currently on."
                ),
                createElement("br"),
                createElement("b", {}, "Shift"),
                createElement(
                  "small",
                  {},
                  "Hold key and click multiple objects to select multiple objects."
                ),
                createElement("br"),
                createElement("b", {}, "Delete/Backspace"),
                createElement(
                  "small",
                  {},
                  "While object is selected, press key to remove object from table."
                ),
              ])
            );
          },
        }
      )
    );
  };
}

const tableApp = new Table({ domComponent: document.getElementById("app") });
export default tableApp;
