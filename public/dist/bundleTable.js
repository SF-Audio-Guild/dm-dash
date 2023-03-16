let state = {
  config: {
    // serverURL: 'http://localhost:4000'
    serverURL: "http://localhost:4000",
    queryLimit: 10,
    queryOffset: 10,
  }
};

if (history.state && history.state.applicationState) {
  state = history.state.applicationState;
}

var state$1 = state;

function createElement(
  element,
  attributes,
  inner,
  eventListeners
) {
  if (typeof element === "undefined") {
    return false;
  }
  if (typeof inner === "undefined") {
    inner = "";
  }
  var el = document.createElement(element);
  
  if (typeof attributes === "object") {
    for (var attribute in attributes) {
      el.setAttribute(attribute, attributes[attribute]);
    }
  }
  if(inner) {
    if (!Array.isArray(inner)) {
      inner = [inner];
    }
    for (var k = 0; k < inner.length; k++) {
      if (inner[k].tagName) {
        el.appendChild(inner[k]);
      } else {
        el.appendChild(document.createTextNode(inner[k]));
      }
    }
  }
  if(eventListeners) {
    if (!Array.isArray(eventListeners)) {
      eventListeners = [eventListeners];
    }
    for (var event of eventListeners ) {
      el.addEventListener(event.type, event.event);
    }
  }
  return el;
}

class Toast {
  constructor() {
    this.isVisible = false;
    this.message = "";
    this.domComponent = document.getElementById("toast");
    if(!this.domComponent) return;
    this.domComponent.style.visibility = "hidden";

    this.isError = false;

    this.render();
  }

  show = (message) => {
    if (!this.domComponent) return;
    this.isVisible = true;
    this.message = message;
    this.render();
    this.domComponent.style.visibility = "visible";
    const timer = setTimeout(() => {
      this.hide();
    }, 2000);
    this.timer = timer;
  };

  error = (message) => {
    if (!this.domComponent) return;
    this.isError = true;
    this.show(message);
  };

  hide = () => {
    if (!this.domComponent) return;
    clearTimeout(this.timer);
    this.isVisible = false;
    this.isError = false;
    this.message = "";
    this.domComponent.style.visibility = "hidden";
  };

  render = () => {
    if (!this.domComponent) return;
    this.domComponent.innerHTML = "";

    if (this.isError)
      return this.domComponent.append(
        createElement("div", { class: "toast toast-error" }, this.message)
      );
    else
      return this.domComponent.append(
        createElement("div", { class: "toast" }, this.message)
      );
  };
}

const toast = new Toast();

async function getThings(endpoint) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      headers: {
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (res.status === 200) {
      return data;
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function deleteThing(endpoint) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      method: "DELETE",
      headers: {
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 204) {
      toast.show("Removed");
    } else {
      throw new Error();
    }
  } catch (err) {
    toast.error("Error");
    console.log(err);
  }
}

async function postThing(endpoint, body) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      toast.show("Success");
      return data;
    } else throw new Error();
  } catch (err) {
    // window.alert("Failed to save note...");
    console.log(err);
    toast.error("Error");
    return null;
  }
}

function renderSpinner() {
  return createElement("div", {class: "lds-dual-ring"})
}

function renderLoadingWithMessage(message) {
  return createElement(
    "div",
    { style: "align-self: center; display: flex; flex-direction: column; align-items: center;" },
    [
      createElement("h2", {}, message),
      renderSpinner(),
    ]
  );
}

class AccountManager {
  constructor() {
    this.userInfo = null;

    this.editEmail = false;
    this.saveEmailLoading = false;
    this.init();
  }

  toggleEditEmail = () => {
    this.editEmail = !this.editEmail;
    this.renderAccountApp();
  };

  toggleSaveEmailLoading = () => {
    this.saveEmailLoading = !this.saveEmailLoading;
    this.renderAccountApp();
  };

  init = async () => {
    try {
      // try to append tabs
      await this.appendAccountTabOrLogin();
      if (!this.userInfo) {
        return (window.location.pathname = "/login.html");
      }
      // stop initial spinner
      if (document.getElementById("initial-spinner")) {
        document.getElementById("initial-spinner").remove();
      }

      // do account app if account page
      if (window.location.pathname === "/account.html") {
        this.renderAccountApp();
      }
    } catch (err) {
      console.log(err);
    }
  };

  verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${window.location.origin}/api/verify_jwt`, {
          headers: { "x-access-token": `Bearer ${token}` },
        });
        const resData = await res.json();
        if (res.status === 200) {
          this.userInfo = resData;
          state$1.user = resData;
          return resData;
        } else if (res.status === 400) {
          console.log("expired token");
          return null;
        } else throw resData.error;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  };

  appendAccountTabOrLogin = async () => {
    const token = await this.verifyToken();
    const navContainer = document.getElementById("nav-links-container");
    const navContainerMobile = document.getElementById(
      "nav-links-container-mobile"
    );
    if (token) {
      navContainer.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/dashboard.html" },
          "Dashboard"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Players"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/account.html" },
          "Account"
        ),
        createElement("a", { class: "top-nav-btn" }, "Logout", {
          type: "click",
          event: () => {
            localStorage.removeItem("token");
            window.location.pathname = "/";
          },
        })
      );
      navContainerMobile.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/dashboard.html" },
          "Dashboard"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Players"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/account.html" },
          "Account"
        ),
        createElement("a", { class: "top-nav-btn" }, "Logout", {
          type: "click",
          event: () => {
            localStorage.removeItem("token");
            window.location.pathname = "/";
          },
        })
      );
    } else {
      navContainer.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
      navContainerMobile.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
    }
  };

  saveEmail = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(
      `/api/edit_user/${this.userInfo.id}`,
      formProps
    );
    if (resData) this.userInfo.email = resData.email;
  };

  renderEmailOrEditEmail = () => {
    if (this.editEmail) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement("h2", {}, "Edit Email"),
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "email" }, "New Email"),
              createElement("input", {
                type: "email",
                id: "email",
                name: "email",
                value: this.userInfo.email,
                required: true,
              }),
              createElement("br"),
              createElement("button", { type: "submit" }, "Done"),
            ],
            {
              type: "submit",
              event: async (e) => {
                e.preventDefault();
                this.editEmail = false;
                this.toggleSaveEmailLoading();
                await this.saveEmail(e);
                this.toggleSaveEmailLoading();
              },
            }
          ),
          createElement("br"),
          createElement("button", { class: "btn-red" }, "Cancel", {
            type: "click",
            event: this.toggleEditEmail,
          }),
        ]
      );
    }

    return createElement(
      "div",
      { style: "display: flex; justify-content: space-between;" },
      [
        createElement("h2", {}, "Email"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement(
            "a",
            { class: "small-clickable", style: "margin-right: 5px" },
            "Edit",
            {
              type: "click",
              event: this.toggleEditEmail,
            }
          ),
          createElement("div", {}, this.userInfo.email),
        ]),
      ]
    );
  };

  renderAccountApp = () => {
    const domComponent = document.getElementById("app");
    domComponent.innerHTML = "";

    if (this.saveEmailLoading) {
      return domComponent.append(
        renderLoadingWithMessage("Saving your new email...")
      );
    }

    // domComponent.className = "component";
    domComponent.append(
      createElement("div", { class: "standard-view" }, [
        createElement("h1", { style: "margin: auto;" }, "Account"),
        createElement("br"),
        createElement("div", { class: "component" }, [
          this.renderEmailOrEditEmail(),
          createElement("br"),
          createElement("hr"),
          createElement("button", {}, "Reset Password", {
            type: "click",
            event: () => {
              window.location.pathname = "/resetpassword.html";
            },
          }),
        ]),
      ])
    );
  };
}

new AccountManager();

class Hamburger {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.id = "hamburger";
    this.domComponent.className = "hamburger";
    this.sidebar = props.sidebar;

    this.domComponent.addEventListener("click", this.toggle);
  }

  hide = () => {
    this.domComponent.innerHTML = "";
  };

  toggle = () => {
    if (this.sidebar.isVisible) {
      this.sidebar.close();
    } else {
      this.sidebar.open();
    }
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement(
        "img",
        {
          height: "40px",
          width: "40px",
          src: "/assets/sidebar.svg",
          class: "flipXAxis",
        },
        null
      )
    );
  };
}

async function getPresignedForImageDownload(imageId) {
  try {
    const res = await fetch(`${window.origin}/api/signed_URL_download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        bucket_name: "wyrld",
        folder_name: "images",
        image_id: imageId,
      }),
    });
    const data = await res.json();
    if (data) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

// async function getPresignedForImageUpload(name) {
//   try {
//     const res = await fetch(`${window.origin}/api/signed_URL_upload`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-access-token": `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify({
//         name,
//         bucket_name: "wyrld",
//         folder_name: "images",
//       }),
//     });
//     const data = await res.json();
    
//     if (data) return data;
//     else throw new Error();
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// }

// export async function uploadImage(image) {
//   try {
//     // first get presigned url
//     const presigned = await getPresignedForImageUpload(image.name);
//     if (presigned) {
//       // take presigned data and send file to bucket
//       const formData = new FormData();

//       Object.keys(presigned.url.fields).forEach((key) => {
//         formData.append(key, presigned.url.fields[key]);
//       });
//       formData.append("file", image);

//       const resAWS = await fetch(presigned.url.url, {
//         method: "POST",
//         body: formData,
//       });
//       // if success return name of image
//       if (resAWS.status === 200 || resAWS.status === 204) {
//         return presigned.imageRef;
//       } else throw new Error();
//     } else throw new Error();
//   } catch (err) {
//     console.log(err);
//   }
// }

async function uploadImage(image, currentProjectId, currentImageId) {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("bucket_name", "wyrld");
    formData.append("folder_name", "images");
    formData.append("project_id", currentProjectId);
    if (currentImageId) formData.append("current_file_id", currentImageId);
    
    const res = await fetch(`${window.origin}/api/file_upload`, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    const data = await res.json();
    
    if (data) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);

    this.projectId = null;

    // message from server TESTING
    this.socket.on("message", (message) => {
      console.log("New socket message", message);
    });
  }

  // Listeners
  setupListeners = (canvasLayer) => {
    // OBJECTS LISTENERS
    this.socket.on("image-add", (newImg) => {
      // console.log("New socket image", newImg);

      fabric.Image.fromURL(newImg.src, function (img) {
        // reconstruct new image
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        // add to canvas
        if (img.layer === "Map") {
          if (canvasLayer.currentLayer === "Object") {
            img.selectable = false;
            img.evented = false;
          }
          const gridObjectIndex = canvasLayer.canvas
            .getObjects()
            .indexOf(canvasLayer.oGridGroup);
          canvasLayer.canvas.add(img);
          img.moveTo(gridObjectIndex);
        } else {
          if (canvasLayer.currentLayer === "Map") {
            img.opacity = "0.5";
            img.selectable = false;
            img.evented = false;
          }
          canvasLayer.canvas.add(img);
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
          if (canvasLayer.currentLayer === "Map") {
            if (object.layer === "Object") {
              object.opacity = "0.5";
              object.selectable = false;
              object.evented = false;
            } else {
              object.opacity = "1";
              object.selectable = true;
              object.evented = true;
            }
          } else {
            if (object.layer === "Map") {
              object.opacity = "1";
              object.selectable = false;
              object.evented = false;
            } else {
              object.opacity = "1";
              object.selectable = true;
              object.evented = true;
            }
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
          if (item.layer === "Map") {
            const gridObjectIndex = canvasLayer.canvas
              .getObjects()
              .indexOf(canvasLayer.oGridGroup);
            item.moveTo(gridObjectIndex - 1);
          } else {
            item.bringToFront();
          }
        }
      });
      //
    });
  };

  socketTest = () => {
    this.socket.emit("joinProject", {
      // user: state.user.email,
      project: `project-${this.projectId}`,
    });
  };
  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      project: `project-${this.projectId}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      project: `project-${this.projectId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      project: `project-${this.projectId}`,
      image,
    });
  };

  objectMoveUp = (object) => {
    this.socket.emit("object-moved-up", {
      project: `project-${this.projectId}`,
      object,
    });
  };
}
const socketIntegration = new SocketIntegration();

class TableSidebarComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar";
    this.canvasLayer = props.canvasLayer;

    this.imageLoading = false;
    this.render();

    this.downloadedImageSourceList = {};
  }

  toggleImageLoading = () => {
    this.imageLoading = !this.imageLoading;
    this.render();
  };

  renderImage = async (imageId) => {
    const imageSource = await getPresignedForImageDownload(imageId);
    if (imageSource) {
      this.downloadedImageSourceList[imageId] = imageSource.url;
      return createElement("img", {
        src: imageSource.url,
        width: 30,
        height: 30,
      });
    }
  };

  addImageToTable = async (image) => {
    let imageSource = this.downloadedImageSourceList[image.id];
    if (!imageSource)
      imageSource = await getPresignedForImageDownload(image.id);
    if (imageSource) {
      // create new object
      fabric.Image.fromURL(imageSource, (newImg) => {
        // CREATE ************************
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.canvasLayer.currentLayer);

        // HANDLE ************************
        // add to canvas
        if (this.canvasLayer.currentLayer === "Map") {
          const gridObjectIndex = this.canvasLayer.canvas
            .getObjects()
            .indexOf(this.canvasLayer.oGridGroup);
          this.canvasLayer.canvas.add(newImg);
          // in center of viewport
          this.canvasLayer.canvas.viewportCenterObject(newImg);
          newImg.moveTo(gridObjectIndex);
        } else {
          this.canvasLayer.canvas.add(newImg);
          // in center of viewport
          this.canvasLayer.canvas.viewportCenterObject(newImg);
        }

        // event listener
        newImg.on("selected", (options) => {
          this.canvasLayer.moveObjectUp(options.target);
        });

        // EMIT ***************************
        socketIntegration.imageAdded(newImg);
      });
    }
  };

  removeImageFromTableAndSidebar = (image, tableImage, elem) => {
    if (
      window.confirm(`Are you sure you want to delete ${image.original_name}`)
    ) {
      // remove image in db
      deleteThing(`/api/remove_image/${state$1.currentProject.id}/${image.id}`);
      // remove table image in db
      deleteThing(`/api/remove_table_image/${tableImage.id}`);
      // remove elem in sidebar
      elem.remove();
      // remove all from screens and sockets and state
      this.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.imageId === image.id) {
          this.canvasLayer.canvas.remove(object);
          socketIntegration.imageRemoved(object.id);
        }
      });
    }
  };

  renderCurrentImages = async () => {
    const tableImages = await getThings(
      `/api/get_table_images/${state$1.currentProject.id}`
    );
    if (!tableImages.length) return [createElement("small", {}, "None...")];

    let imageElems = [];
    await Promise.all(
      tableImages.map(async (tableImage) => {
        const image = await getThings(`/api/get_image/${tableImage.image_id}`);
        if (image) {
          const elem = createElement("div", { class: "sidebar-image-item" }, [
            createElement("a", {}, "+", {
              type: "click",
              event: async () => {
                await this.addImageToTable(image);
              },
            }),
            createElement(
              "div",
              { style: "width: 100px; word-wrap: break-word;" },
              image.original_name
            ),
            await this.renderImage(image.id),
            createElement(
              "div",
              {
                style:
                  "color: var(--red1); margin-left: 10px; cursor: pointer;",
              },
              "ⓧ",
              {
                type: "click",
                event: () => {
                  this.removeImageFromTableAndSidebar(image, tableImage, elem);
                },
              }
            ),
          ]);
          imageElems.push(elem);
        }
      })
    );
    imageElems = imageElems.sort((a, b) => {
      if (
        a.children[1].innerText.toUpperCase() <
        b.children[1].innerText.toUpperCase()
      )
        return -1;
    });
    if (imageElems.length) return imageElems;
    else return [createElement("small", {}, "None...")];
  };

  addImageToSidebar = async (e) => {
    const file = e.target.files[0];
    if (file) {
      this.toggleImageLoading();
      const newImage = await uploadImage(file, state$1.currentProject.id);
      if (newImage) {
        // add new table image
        await postThing(`/api/add_table_image`, {
          project_id: state$1.currentProject.id,
          image_id: newImage.id,
        });
        // re render
      }
      this.toggleImageLoading();
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.imageLoading) {
      return this.domComponent.append(renderLoadingWithMessage(""));
    }

    this.domComponent.append(
      createElement(
        "input",
        {
          id: "image",
          name: "image",
          type: "file",
          accept: "image/*",
          style: "display: none",
        },
        null,
        {
          type: "change",
          event: async (e) => {
            await this.addImageToSidebar(e);
          },
        }
      ),
      createElement(
        "label",
        {
          for: "image",
          class: "label-btn",
        },
        "+ Image"
      ),
      createElement("br"),
      ...(await this.renderCurrentImages())
    );
  };
}

class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.canvasLayer = props.canvasLayer;
    this.isVisible = false;
    this.navigate = props.navigate;
  }

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "/assets/sidebar.svg",
      height: 32,
      width: 32,
    });
    elem.addEventListener("click", this.close);
    return elem;
  };

  close = () => {
    this.isVisible = false;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(200px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "2";
  };

  open = () => {
    this.isVisible = true;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(0px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "4";
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    const tableSidebarComponentElem = createElement("div", {
      style: "display: flex; flex-direction: column;",
    });
    new TableSidebarComponent({
      domComponent: tableSidebarComponentElem,
      canvasLayer: this.canvasLayer,
    });
    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement("div", { class: "sidebar-header" }, "Images"),
        tableSidebarComponentElem,
        this.renderCloseSidebarElem(),
      ]
    );
    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}

class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.tableViews = props.tableViews;
    this.currentTableView = this.tableViews[0];
    console.log(this.currentTableView);
    this.currentLayer = "Object";

    // grid
    this.grid = 50;
    this.unitScale = 10;
    this.canvasWidth = 250 * this.unitScale;
    this.canvasHeight = 250 * this.unitScale;
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

    // init canvas
    this.canvas = new fabric.Canvas("canvas-layer", {
      containerClass: "canvas-layer",
      height: window.innerHeight,
      width: window.innerWidth,
      preserveObjectStacking: true,
      // isDrawingMode: true,
      backgroundColor: "black",
    });
    // write new grid if there isn't objects in previous data
    if (!this.currentTableView.data.objects) {
      this.renderGridObjects();
    } else {
      if (!this.currentTableView.data.objects.length) {
        this.renderGridObjects();
      } else {
        // update image links
        const imageSrcList = {};

        await Promise.all(
          this.currentTableView.data.objects.map(async (object) => {
            // if (object.type === "group") return object;
            if (object.imageId) {
              console.log(object.imageId);
              if (imageSrcList[object.imageId]) {
                object.src = imageSrcList[object.imageId];
              } else {
                const presigned = await getPresignedForImageDownload(
                  object.imageId
                );
                object.src = presigned.url;
                imageSrcList[object.imageId] = object.src;
              }
            }
          })
        );
        // render old data
        this.canvas.loadFromJSON(this.currentTableView.data, () => {
          this.canvas.getObjects().forEach((object) => {
            // group layer events
            if (object.type === "group") {
              this.oGridGroup = object;
              object.selectable = false;
              object.evented = false;
              return;
            }
            // set event listeners
            object.on("selected", (options) => {
              this.moveObjectUp(options.target);
            });
            // handle layer events
            if (this.currentLayer === "Map") {
              if (object.layer === "Object") {
                object.opacity = "0.5";
                object.selectable = false;
                object.evented = false;
              } else {
                object.opacity = "1";
                object.selectable = true;
                object.evented = true;
              }
            } else {
              if (object.layer === "Map") {
                object.opacity = "1";
                object.selectable = false;
                object.evented = false;
              } else {
                object.opacity = "1";
                object.selectable = true;
                object.evented = true;
              }
            }
          });
          this.canvas.renderAll();
        });
      }
    }
    this.setupEventListeners();
  };

  setupEventListeners = () => {
    // snap to grid
    this.canvas.on("object:moving", (options) => {
      const left = Math.round(options.target.left / this.grid) * this.grid;
      const top = Math.round(options.target.top / this.grid) * this.grid;
      options.target.set({
        left,
        top,
      });
      socketIntegration.imageMoved(options.target);
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

    this.canvas.on("mouse:down", (opt) => {
      var evt = opt.e;
      if (evt.altKey === true || !opt.target || !opt.target.selectable) {
        this.canvas.isDragging = true;
        this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });

    this.canvas.on("mouse:move", (opt) => {
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
    this.canvas.on("mouse:up", (opt) => {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.canvas.selection = true;
    });

    // remove selected objects
    document.addEventListener("keyup", (e) => {
      var key = e.key;
      if (key === "Backspace" || key === "Delete") {
        if (this.canvas.getActiveObjects().length) {
          this.canvas.getActiveObjects().forEach((object) => {
            this.canvas.remove(object);
            socketIntegration.imageRemoved(object.id);
            this.saveToDatabase();
          });
        }
      }
    });

    // more object event handlers
    this.canvas.on("object:rotating", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async (evt) => {
        await this.saveToDatabase();
      }, 3000)
    );
  };

  moveObjectUp = (object) => {
    if (object.layer === "Map") {
      const gridObjectIndex = this.canvas.getObjects().indexOf(this.oGridGroup);
      object.moveTo(gridObjectIndex - 1);
    } else {
      object.bringToFront();
    }
    socketIntegration.objectMoveUp(object);
  };

  saveToDatabase = async () => {
    const jsonCanvas = this.canvas.toJSON();
    try {
      const res = await fetch(
        window.location.origin +
          `/api/edit_table_view/${this.currentTableView.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
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

  renderGridObjects = () => {
    // create grid
    const gridLineList = [];

    for (var i = 0; i < this.canvasWidth / this.grid; i++) {
      const lineh = new fabric.Line(
        [i * this.grid, 0, i * this.grid, this.canvasHeight],
        {
          type: "line",
          stroke: "#ccc",
          selectable: false,
        }
      );
      gridLineList.push(lineh);
      const linew = new fabric.Line(
        [0, i * this.grid, this.canvasWidth, i * this.grid],
        {
          type: "line",
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
    this.projectId = history.state;
    const project = await getThings(`/api/get_project/${this.projectId}`);
    state$1.currentProject = project;
    const tableViews = await getThings(
      `/api/get_table_views/${state$1.currentProject.id}`
    );
    // create canvas elem and append
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });
    this.canvasLayer = new CanvasLayer({ tableViews });
    socketIntegration.projectId = this.projectId;
    // setup socket listeners after canvas instantiation
    socketIntegration.socketTest();
    socketIntegration.setupListeners(this.canvasLayer);

    this.instantiateSidebar();
    this.instantiateHamburger();

    this.render();
    this.canvasLayer.init();
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new TableSidebar({
      domComponent: sidebarElem,
      canvasLayer: this.canvasLayer,
    });
    this.sidebar = sidebar;
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

  renderTopLayerOrNot = () => {
    // create UI layer above canvas and append
    const topLayerElem = createElement("div");
    new TopLayer({
      domComponent: topLayerElem,
      canvasLayer: this.canvasLayer,
    });

    if (state$1.currentProject.is_editor === false) {
      return createElement("div", {style: "display: none;"});
    } else {
      return topLayerElem;
    }
  };

  render = async () => {
    this.renderSidebarAndHamburger();

    this.domComponent.append(
      createElement("div", { style: "position: relative;" }, [
        this.renderTopLayerOrNot(),
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
    this.canvasLayer.canvas.getObjects().indexOf(this.canvasLayer.oGridGroup);

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

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "canvas-ui-elem" }, [
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
      ])
    );
  };
}

const tableApp = new Table({ domComponent: document.getElementById("app") });

export { tableApp as default };