import imageFollowingCursor from "../imageFollowingCursor.js";
import { getPresignedUrlsForImages } from "../../lib/imageUtils.js";
import socketIntegration from "./socketIntegration.js";

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.currentTableView = props.tableView;
    this.currentLayer = "Object";
    this.snapToGrid = true;
    this.tableView = props.tableView;

    // table sidebar component
    this.tableSidebarImageComponent = props.tableSidebarImageComponent;

    // grid
    this.grid = 100;
    this.unitScale = 10;
    this.canvasWidth = 400 * this.unitScale;
    this.canvasHeight = 400 * this.unitScale;
    this.oGridGroup;

    // event setup
    this.rightClick = false;
  }

  init = async () => {
    //EXTEND THE PROPS FABRIC WILL EXPORT TO JSON
    fabric.Object.prototype.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id,
          imageId: this.imageId,
          layer: this.layer,
          selectable: this.selectable,
          evented: this.evented,
        });
      };
    })(fabric.Object.prototype.toObject);

    // OVERWRITE GROUP TO DISABLE PROPERTIES
    fabric.Group.prototype.hasControls = false;
    fabric.Group.prototype.lockScalingX = true;
    fabric.Group.prototype.lockScalingY = true;
    fabric.Group.prototype.lockRotation = true;

    // init fabric canvas
    this.canvas = new fabric.Canvas("canvas-layer", {
      containerClass: "canvas-layer",
      height: window.innerHeight,
      width: window.innerWidth,
      preserveObjectStacking: true,
      // isDrawingMode: true,
      backgroundColor: "black",
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
      defaultCursor: "grab",
      hoverCursor: "pointer",
      freeDrawingCursor: "cell",
    });

    // write new grid if there isn't objects in previous data
    if (!this.currentTableView.data.objects) {
      this.renderGridObjects();
    } else {
      if (!this.currentTableView.data.objects.length) {
        this.renderGridObjects();
      } else {
        // update image links
        const imageIds = [
          ...new Set(
            this.currentTableView.data.objects
              .filter((object) => Boolean(object.imageId))
              .map((object) => object.imageId)
          ),
        ];
        const presignedUrls = await getPresignedUrlsForImages(imageIds);
        for (let object of this.currentTableView.data.objects) {
          if (object.imageId) {
            if (presignedUrls.urls[object.imageId]) {
              object.src = presignedUrls.urls[object.imageId];
            } else {
              delete this.currentTableView.data.objects[object];
            }
          }
        }
        // render the saved data for the current table view
        await this.renderSavedData();
      }
    }
    // init event listeners
    this.setupEventListeners();
  };

  setupEventListeners = () => {
    // objects
    this.canvas.on("object:moving", (options) => {
      if (this.snapToGrid) {
        // align to grid
        const left = Math.round(options.target.left / this.grid) * this.grid;
        const top = Math.round(options.target.top / this.grid) * this.grid;
        options.target.set({
          left,
          top,
        });
      }
      // if multiple objects calculate special distance
      if (options.target.hasOwnProperty("_objects")) {
        for (var object of options.target._objects) {
          let absoluteLeft =
            object.left + options.target.left + options.target.width / 2;
          let absoluteTop =
            object.top + options.target.top + options.target.height / 2;
          const newObj = JSON.parse(JSON.stringify(object)); // important not to disturb original object
          newObj.left = absoluteLeft;
          newObj.top = absoluteTop;
          socketIntegration.imageMoved(newObj);
        }
      } else socketIntegration.imageMoved(options.target);
    });

    // Zoom
    this.canvas.on("mouse:wheel", (opt) => {
      var delta = opt.e.deltaY;
      var zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.25) zoom = 0.25;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    this.canvas.on("touch:gesture", (opt) => {
      if (opt.e.touches && opt.e.touches.length == 2) {
        this.canvas.isDragging = false;
        const point = new fabric.Point(opt.self.x, opt.self.y);
        const zoom = this.canvas.getZoom();
        const delta = zoom / opt.self.scale;

        this.canvas.zoomToPoint(point, delta);

        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    });
    // mouse down
    this.canvas.on("mouse:down", (opt) => {
      var evt = opt.e;
      // select multiple with altkey which is tehcnically default behavior
      if (evt.altKey === true) return; // overriding default to allow for panning around as default
      if (this.canvas.isDrawingMode) return;
      // else pan
      if (!opt.target || !opt.target.selectable) {
        this.canvas.isDragging = true;
        this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });
    // normal movement
    this.canvas.on("mouse:move", (opt) => {
      // dont use for mobile
      if (detectMob()) return;

      if (this.canvas.isDragging) {
        var e = opt.e;
        var vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
      }
    });
    // for mobile
    this.canvas.on("touch:drag", (opt) => {
      if (!detectMob()) return;

      if (this.canvas.isDragging) {
        const xChange = opt.self.x - this.canvas.lastPosTouchX;
        const yChange = opt.self.y - this.canvas.lastPosTouchY;
        if (
          Math.abs(opt.self.x - this.canvas.lastPosTouchX) <= 50 &&
          Math.abs(opt.self.y - this.canvas.lastPosTouchY) <= 50
        ) {
          var delta = new fabric.Point(xChange, yChange);
          this.canvas.relativePan(delta);
        }

        this.canvas.lastPosTouchX = opt.self.x;
        this.canvas.lastPosTouchY = opt.self.y;
      }
    });
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    this.canvas.on("mouse:up", (opt) => {
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.canvas.selection = true;
    });

    // PATH for drawing
    this.canvas.on("path:created", (opt) => {
      const id = uuidv4();
      opt.path.set("id", id);
      opt.path.set("layer", this.currentLayer);

      // Remove initial drawing created by canvas
      this.canvas.remove(opt.path);

      // Add the path to the canvas on the correct layer
      switch (this.currentLayer) {
        case "Map":
          this.canvas.add(opt.path);
          // Move the path to the correct z-index (below the grid)
          const gridObjectIndex = this.canvas
            .getObjects()
            .indexOf(this.oGridGroup);
          opt.path.moveTo(gridObjectIndex);
          break;

        case "Object":
          this.canvas.add(opt.path);
          // Move the path to the highest index below the fog layer
          const fogObjects = this.canvas
            .getObjects()
            .filter((obj) => obj.layer === "Fog");
          const lowestFogIndex =
            fogObjects.length > 0
              ? this.canvas.getObjects().indexOf(fogObjects[0])
              : this.canvas.getObjects().length;
          opt.path.moveTo(lowestFogIndex);
          break;

        case "Fog":
          this.canvas.add(opt.path);
          // Move the path to the very top (highest layer index)
          opt.path.moveTo(this.canvas.getObjects().length - 1);
          break;
      }

      // Add event listeners
      opt.path.on("selected", (options) => {
        this.moveObjectUp(options.target);
      });

      // Emit through the socket
      socketIntegration.imageAdded(opt.path);
    });

    // KEYS
    document.addEventListener("keydown", (e) => {
      // alt key change cursor
      if (e.altKey) {
        this.canvas.defaultCursor = "crosshair";
        this.canvas.setCursor("crosshair");
      }
      // move active objects to other layer
      // if (e.ctrlKey && e.key == "m") {
      //   // only allow gm to do this
      //   if (USERID == this.tableView.user_id || IS_MANAGER_OR_OWNER) {
      //     const activeObjects = this.canvas.getActiveObjects();
      //     for (var object of activeObjects) {
      //       this.moveObjectToOtherLayer(object);
      //     }
      //   } else return;
      // }
      // duplicate
      if (e.ctrlKey && e.key == "d") {
        const activeObjects = this.canvas.getActiveObjects();
        for (var object of activeObjects) {
          object.clone((clone) => {
            // new id
            const id = uuidv4();
            clone.set("id", id);
            clone.set("layer", object.layer);

            // place close to the original
            if (object.group) {
              let absoluteLeft =
                object.left + object.group.left + object.group.width / 2;
              let absoluteTop =
                object.top + object.group.top + object.group.height / 2;
              clone.set("left", absoluteLeft + 50);
              clone.set("top", absoluteTop + 50);
            } else {
              clone.set("left", object.left + 50);
              clone.set("top", object.top + 50);
            }

            // add to canvas on correct layer
            switch (object.layer) {
              case "Map":
                this.canvas.add(clone);
                // Move the clone to the correct z-index (below the grid)
                const gridObjectIndex = this.canvas
                  .getObjects()
                  .indexOf(this.oGridGroup);
                clone.moveTo(gridObjectIndex);
                break;

              case "Object":
                this.canvas.add(clone);
                // Move the clone to the highest index below the fog layer
                const fogObjects = this.canvas
                  .getObjects()
                  .filter((obj) => obj.layer === "Fog");
                const lowestFogIndex =
                  fogObjects.length > 0
                    ? this.canvas.getObjects().indexOf(fogObjects[0])
                    : this.canvas.getObjects().length;
                clone.moveTo(lowestFogIndex);
                break;

              case "Fog":
                this.canvas.add(clone);
                // Move the clone to the very top (highest layer index)
                clone.moveTo(this.canvas.getObjects().length - 1);
                break;
            }

            // send to socket
            socketIntegration.imageAdded(clone);
          });
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      var key = e.key;
      // remove selected objects
      if (key === "Backspace" || key === "Delete") {
        if (this.canvas.getActiveObjects().length) {
          this.canvas.getActiveObjects().forEach((object) => {
            if (object.hasOwnProperty("_objects")) {
              for (var subObj of object._objects) {
                this.canvas.remove(subObj);
                socketIntegration.imageRemoved(subObj.id);
              }
            }
            this.canvas.remove(object);
            socketIntegration.imageRemoved(object.id);
            this.saveToDatabase();
          });
        }
      }

      // reset cursor to default
      this.canvas.defaultCursor = "grab";
      this.canvas.setCursor("grab");
    });

    // more object event handlers
    this.canvas.on("object:rotating", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    // DOCUMENT MOUSE UP HACKS
    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async () => {
        await this.saveToDatabase();
      }, 3000)
    );
    // save data on touch screen up
    document.addEventListener(
      "touchend",
      throttle(async () => {
        await this.saveToDatabase();
      }, 3000)
    );

    document.addEventListener("mouseup", (e) => {
      // handle adding new image
      if (imageFollowingCursor.isOnPage) {
        if (e.target.nodeName === "CANVAS")
          this.addImageToTable(
            this.tableSidebarImageComponent.currentMouseDownImage
          );
      }
      imageFollowingCursor.remove();

      // remove status of holding multi-select on right click down
      this.rightClick = false;
    });
  };

  addImageToTable = async (image) => {
    if (image.src) {
      fabric.Image.fromURL(image.src, (newImg) => {
        // create new image
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.currentLayer);

        // add to canvas on correct layer
        switch (this.currentLayer) {
          case "Map":
            this.canvas.add(newImg);
            // Center the new image in the viewport
            this.canvas.viewportCenterObject(newImg);

            const gridObjectIndex = this.canvas
              .getObjects()
              .indexOf(this.oGridGroup);
            newImg.moveTo(gridObjectIndex);
            break;

          case "Object":
            this.canvas.add(newImg);
            // Center the new image in the viewport
            this.canvas.viewportCenterObject(newImg);

            // Move the new image to the highest index below the fog layer
            const fogObjects = this.canvas
              .getObjects()
              .filter((obj) => obj.layer === "Fog");
            const lowestFogIndex =
              fogObjects.length > 0
                ? this.canvas.getObjects().indexOf(fogObjects[0])
                : this.canvas.getObjects().length;
            newImg.moveTo(lowestFogIndex);

            break;

          case "Fog":
            this.canvas.add(newImg);
            // Center the new image in the viewport
            this.canvas.viewportCenterObject(newImg);

            // Move the new image to the very top (highest layer index)
            newImg.moveTo(this.canvas.getObjects().length - 1);

            break;
        }

        // add event listeners
        newImg.on("selected", (options) => {
          this.moveObjectUp(options.target);
        });

        // emit through through socket
        socketIntegration.imageAdded(newImg);
      });
    }
  };

  moveObjectUp = (object) => {
    // Do nothing for now... broken
    return;
    switch (object.layer) {
      case "Map":
        const gridObjectIndex = this.canvas
          .getObjects()
          .indexOf(this.oGridGroup);
        object.moveTo(gridObjectIndex - 1);
        break;

      case "Object":
        const objects = this.canvas.getObjects();
        const fogBottomIndex =
          objects.filter((obj) => obj.layer === "Fog").length + 2;
        object.moveTo(fogBottomIndex);
        break;

      case "Fog":
        object.bringToFront();
        break;
    }
    // emit through socket
    socketIntegration.objectMoveUp(object);
  };

  // moveObjectToOtherLayer = (object) => {
  //   if (object.layer === "Map") {
  //     object.layer = "Object";
  //     object.bringToFront();
  //     this.updateObjectProperties(object);
  //   } else if (object.layer === "Object") {
  //     object.layer = "Map";
  //     const gridObjectIndex = this.canvas.getObjects().indexOf(this.oGridGroup);
  //     object.moveTo(gridObjectIndex);
  //     this.updateObjectProperties(object);
  //   } else if (object.layer === "Fog") {
  //     // Logic to handle moving from Fog layer if necessary
  //   }

  //   // Emit through socket
  //   socketIntegration.objectChangeLayer(object);
  // };

  // Function to update object properties based on current layer
  updateObjectProperties = (object) => {
    if (object.layer === "Map") {
      object.selectable = this.currentLayer === "Map";
      object.evented = this.currentLayer === "Map";
      object.opacity = this.currentLayer === "Fog" ? "0.5" : "1";
    } else if (object.layer === "Object") {
      object.selectable = this.currentLayer === "Object";
      object.evented = this.currentLayer === "Object";
      object.opacity = this.currentLayer !== "Object" ? "0.5" : "1";
    } else if (object.layer === "Fog") {
      object.selectable = this.currentLayer === "Fog";
      object.evented = this.currentLayer === "Fog";
      object.opacity = this.currentLayer !== "Fog" ? "0.5" : "1";
    }
  };

  saveToDatabase = async () => {
    const jsonCanvas = this.canvas.toJSON();
    try {
      const res = await fetch(
        `/api/edit_table_view_data/${this.currentTableView.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: jsonCanvas }),
        }
      );
      // const data = await res.json();
      // if (res.status === 200 || res.status === 201) {
      //   return data;
      // } else throw new Error();
    } catch (err) {
      // window.alert("Failed to save note...");
      console.log(err);
      return null;
    }
  };
  renderSavedData = async () => {
    return new Promise((resolve) => {
      // Render old data
      this.canvas.loadFromJSON(this.currentTableView.data, () => {
        this.canvas.getObjects().forEach((object) => {
          // Group layer events
          if (object.type === "group") {
            this.oGridGroup = object;
            // Handle if grid is snapping based on visibility
            if (!this.oGridGroup.visible) this.snapToGrid = false;
            object.selectable = false;
            object.evented = false;
            return;
          }
          // Set event listeners
          object.on("selected", (options) => {
            this.moveObjectUp(options.target);
          });
          // Handle layer events using updateObjectProperties
          this.updateObjectProperties(object);
        });
        this.canvas.renderAll();
        resolve();
      });
    });
  };

  renderGridObjects = () => {
    // create grid
    const gridLineList = [];

    for (var i = 0; i < this.canvasWidth / this.grid; i++) {
      const lineh = new fabric.Line(
        [i * this.grid + 0.5, 0, i * this.grid + 0.5, this.canvasHeight],
        {
          type: "line",
          strokeWidth: 1,
          stroke: "#ccc",
          selectable: false,
        }
      );
      gridLineList.push(lineh);
      const linew = new fabric.Line(
        [0, i * this.grid + 0.5, this.canvasWidth, i * this.grid + 0.5],
        {
          type: "line",
          strokeWidth: 1,
          stroke: "#ccc",
          selectable: false,
        }
      );
      gridLineList.push(linew);
    }
    this.oGridGroup = new fabric.Group(gridLineList, {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });
    this.canvas.add(this.oGridGroup);
  };

  hideGrid = () => {
    this.oGridGroup.set("visible", false);
    this.canvas.renderAll();
    this.snapToGrid = false;
    socketIntegration.gridChange(false);
  };

  showGrid = () => {
    this.oGridGroup.set("visible", true);
    this.canvas.renderAll();
    this.snapToGrid = true;
    socketIntegration.gridChange(true);
  };
}

///////// UTILS
const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime;
  return function () {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(function () {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

function detectMob() {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}
