class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);

    this.tableId = null;
    this.user = null;
    this.sidebar = null;
    this.topLayer = null;
  }

  // Listeners
  setupListeners = (canvasLayer) => {
    // USER JOIN
    this.socket.on("table-join", (message) => {
      console.log("User Joined:\n", message);
    });

    // TABLE CHANGE
    this.socket.on("table-change", (newTableUUID) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("uuid", newTableUUID);
      const newSearchParamsString = searchParams.toString();

      const newUrl = window.location.pathname + "?" + newSearchParamsString;
      // Prompt the user
      if (
        confirm(
          "The GM has requested that you migrate to a new virtual table location, would you like to proceed?"
        )
      ) {
        window.location.href = newUrl;
      }
    });
    // ERROR
    this.socket.on("connect_error", (error) => {
      console.log(error);
      if (window.confirm("There was a connection error, refresh the page?")) {
        history.go();
      }
    });

    this.socket.on("disconnect", (error) => {
      console.log(error);
      if (window.confirm("There was a connection error, refresh the page?")) {
        history.go();
      }
    });

    // UPDATE CURRENT USERS
    this.socket.on("current-users", (list) => {
      if (this.sidebar) {
        this.sidebar.onlineUsersComponent.usersList = list;
        this.sidebar.onlineUsersComponent.render();
      }
    });

    // TABLE MESSAGES
    this.socket.on("table-messages", (messages) => {
      // check if top layer exists and update messages
      if (
        this.topLayer &&
        this.topLayer.chatBoxComponent &&
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent
      ) {
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent.chatBoxMessages =
          messages;
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent.render();
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent.scrollDown();
      }
    });

    this.socket.on("message", (message) => {
      if (
        this.topLayer &&
        this.topLayer.chatBoxComponent &&
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent
      ) {
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent.chatBoxMessages.push(
          message
        );
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent.render();
        this.topLayer.chatBoxComponent.chatBoxMessagesComponent.scrollDown();
      }
    });

    // GRID
    this.socket.on("grid-change", (gridState) => {
      // console.log("grid change", gridState)
      canvasLayer.oGridGroup.visible = gridState;
      canvasLayer.snapToGrid = gridState;
      canvasLayer.canvas.renderAll();
      if (this.topLayer) {
        this.topLayer.render();
      }
    });

    // OBJECTS LISTENERS
    this.socket.on("image-add", (newImg) => {
      // console.log("New socket image", newImg);
      // Path drawing
      if (!newImg.src) {
        const newPath = new fabric.Path(newImg.path);
        newPath.set({
          id: newImg.id,
          left: newImg.left,
          top: newImg.top,
          fill: false,
          stroke: newImg.stroke,
          strokeWidth: newImg.strokeWidth,
        });
        return canvasLayer.canvas.add(newPath);
      }

      // uploaded images
      fabric.Image.fromURL(newImg.src, (img) => {
        // reconstruct new image
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        // add to canvas on correct layer
        switch (canvasLayer.currentLayer) {
          case "Map":
            canvasLayer.canvas.add(img);
            // Center the new image in the viewport
            canvasLayer.canvas.viewportCenterObject(img);

            const gridObjectIndex = canvasLayer.canvas
              .getObjects()
              .indexOf(canvasLayer.oGridGroup);
            img.moveTo(gridObjectIndex);
            break;

          case "Object":
            canvasLayer.canvas.add(img);
            // Center the new image in the viewport
            canvasLayer.canvas.viewportCenterObject(img);

            // Move the new image to the highest index below the fog layer
            const fogObjects = canvasLayer.canvas
              .getObjects()
              .filter((obj) => obj.layer === "Fog");
            const lowestFogIndex =
              fogObjects.length > 0
                ? canvasLayer.canvas.getObjects().indexOf(fogObjects[0])
                : canvasLayer.canvas.getObjects().length;
            img.moveTo(lowestFogIndex);

            break;

          case "Fog":
            canvasLayer.canvas.add(img);
            // Center the new image in the viewport
            canvasLayer.canvas.viewportCenterObject(img);

            // Move the new image to the very top (highest layer index)
            img.moveTo(canvasLayer.canvas.getObjects().length - 1);

            break;
        }
        // event listener
        img.on("selected", (options) => {
          canvasLayer.moveObjectUp(options.target);
        });
      });
    });

    this.socket.on("image-remove", (id) => {
      // console.log("Remove socket image", id);

      canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === id) {
          canvasLayer.canvas.remove(object);
        }
      });
    });

    this.socket.on("image-move", (image) => {
      // console.log("Move socket image", image);
      canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === image.id) {
          for (var [key, value] of Object.entries(image)) {
            object[key] = value;
          }
          if (object.layer === "Map") {
            object.selectable = canvasLayer.currentLayer === "Map";
            object.evented = canvasLayer.currentLayer === "Map";
            object.opacity = canvasLayer.currentLayer === "Fog" ? "0.5" : "1";
          } else if (object.layer === "Object") {
            object.selectable = canvasLayer.currentLayer === "Object";
            object.evented = canvasLayer.currentLayer === "Object";
            object.opacity =
              canvasLayer.currentLayer !== "Object" ? "0.5" : "1";
          } else if (object.layer === "Fog") {
            object.selectable = canvasLayer.currentLayer === "Fog";
            object.evented = canvasLayer.currentLayer === "Fog";
            object.opacity = canvasLayer.currentLayer !== "Fog" ? "0.5" : "1";
          }
          canvasLayer.canvas.renderAll();
        }
      });
      //
    });

    this.socket.on("object-move-up", (object) => {
      // console.log("Move socket object up", object);
      canvasLayer.canvas.getObjects().forEach((item) => {
        if (item.id === object.id) {
          switch (item.layer) {
            case "Map":
              const gridObjectIndex = canvasLayer.canvas
                .getObjects()
                .indexOf(canvasLayer.oGridGroup);
              item.moveTo(gridObjectIndex - 1);
              break;

            case "Object":
              const objects = canvasLayer.canvas.getObjects();
              const fogBottomIndex =
                objects.filter((obj) => obj.layer === "Fog").length + 2;
              item.moveTo(fogBottomIndex);
              break;

            case "Fog":
              item.bringToFront();
              break;
          }
        }
      });
      //
    });

    this.socket.on("object-change-layer", (object) => {
      console.log("Move socket object to different layer", object);
      canvasLayer.canvas.getObjects().forEach((item) => {
        if (item.id === object.id) {
          item.layer = object.layer;

          if (item.layer === "Map") {
            const gridObjectIndex = canvasLayer.canvas
              .getObjects()
              .indexOf(canvasLayer.oGridGroup);
            item.moveTo(gridObjectIndex);
            if (canvasLayer.currentLayer === "Map") {
              item.opacity = "1";
              item.selectable = true;
              item.evented = true;
            } else {
              item.opacity = "1";
              item.selectable = false;
              item.evented = false;
            }
          } else if (item.layer === "Object") {
            item.bringToFront();
            if (canvasLayer.currentLayer === "Map") {
              item.opacity = "0.5";
              item.selectable = false;
              item.evented = false;
            } else {
              item.opacity = "1";
              item.selectable = true;
              item.evented = true;
            }
          }
        }
      });
      //
    });
  };

  socketJoined = () => {
    this.socket.emit("table-joined", {
      username: this.user.username,
      table: `table-${this.tableId}`,
    });
  };

  getMessages = () => {
    this.socket.emit("get-messages", {
      table: `table-${this.tableId}`,
    });
  };

  newTableMessage = (content) => {
    this.socket.emit("new-message", {
      table: `table-${this.tableId}`,
      content,
    });
  };

  tableChanged = (newTableUUID) => {
    this.socket.emit("table-changed", {
      table: `table-${this.tableId}`,
      newTableUUID,
    });
  };

  // GRID
  gridChange = (gridState) => {
    this.socket.emit("grid-changed", {
      table: `table-${this.tableId}`,
      gridState,
    });
  };

  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      table: `table-${this.tableId}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      table: `table-${this.tableId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      table: `table-${this.tableId}`,
      image,
    });
  };

  objectMoveUp = (object) => {
    this.socket.emit("object-moved-up", {
      table: `table-${this.tableId}`,
      object,
    });
  };

  objectChangeLayer = (object) => {
    this.socket.emit("object-changed-layer", {
      table: `table-${this.tableId}`,
      object,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
