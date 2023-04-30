import { tipBox } from "./tipBox.js";
import { postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";
import state from "./state.js";

class AccountManager {
  constructor() {
    this.userInfo = null;

    this.editEmail = false;
    this.editUsername = false;
    this.saveLoading = false;
    this.init();
  }

  toggleEditEmail = () => {
    this.editEmail = !this.editEmail;
    this.renderAccountApp();
  };

  toggleEditUsername = () => {
    this.editUsername = !this.editUsername;
    this.renderAccountApp();
  };

  toggleSaveLoading = () => {
    this.saveLoading = !this.saveLoading;
    this.renderAccountApp();
  };

  init = async () => {
    try {
      // try to append tabs
      await this.appendAccountTabOrLogin();
      if (!this.userInfo) {
        if (
          window.location.pathname === "/dashboard.html" ||
          window.location.pathname === "/account.html" ||
          window.location.pathname === "/vtt.html" ||
          window.location.pathname === "/sheets.html" ||
          window.location.pathname === "/5eplayer.html"
        ) {
          return (window.location.pathname = "/login.html");
        }
      }
      // stop initial spinner
      if (document.getElementById("initial-spinner")) {
        document.getElementById("initial-spinner").remove();
      }

      // do account app if account page
      if (window.location.pathname === "/account.html") {
        this.domComponent = document.getElementById("app");
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
          state.user = resData;
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
          "Wyrlds"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Sheets"
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
          "Wyrlds"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Sheets"
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
      navContainer.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/register.html" },
          "Register"
        )
      );
      navContainerMobile.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/register.html" },
          "Register"
        )
      );
    }
  };

  saveUsername = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(`/api/user/edit_user`, formProps);
    if (resData) this.userInfo.username = resData.username;
  };

  renderUsernameOrEditUsername = () => {
    if (this.editUsername) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement("b", {}, "Edit Username"),
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "username" }, "New Username"),
              createElement("input", {
                type: "username",
                id: "username",
                name: "username",
                value: this.userInfo.username,
                required: true,
              }),
              createElement("br"),
              createElement("button", { type: "submit" }, "Done"),
            ],
            {
              type: "submit",
              event: async (e) => {
                e.preventDefault();
                this.editUsername = false;
                this.toggleSaveLoading();
                await this.saveUsername(e);
                this.toggleSaveLoading();
              },
            }
          ),
          createElement("br"),
          createElement("button", { class: "btn-red" }, "Cancel", {
            type: "click",
            event: this.toggleEditUsername,
          }),
        ]
      );
    }

    return createElement(
      "div",
      { style: "display: flex; justify-content: space-between;" },
      [
        createElement("b", {}, "Username"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement(
            "a",
            { class: "small-clickable", style: "margin-right: 5px" },
            "Edit",
            {
              type: "click",
              event: this.toggleEditUsername,
            }
          ),
          createElement("div", {}, this.userInfo.username),
        ]),
      ]
    );
  };

  saveEmail = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(`/api/user/edit_user`, formProps);
    if (resData) this.userInfo.email = resData.email;
  };

  renderEmailOrEditEmail = () => {
    if (this.editEmail) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement("b", {}, "Edit Email"),
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
                this.toggleSaveLoading();
                await this.saveEmail(e);
                this.toggleSaveLoading();
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
        createElement("b", {}, "Email"),
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
    // clear
    this.domComponent.innerHTML = "";

    if (this.saveLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Saving your data...")
      );
    }

    // domComponent.className = "component";
    this.domComponent.append(
      createElement("div", { class: "standard-view" }, [
        createElement("h1", { style: "margin: auto;" }, "Account"),
        createElement("hr", { class: "special-hr" }),
        tipBox(
          "Hi friend! My name is Peli, I'm here to give you tips on how to use these tools so that you can have a pleasant experience on your new adventures! You will find me on the top or the side of many pages with some guidance about how to use each of our features.",
          "/assets/peli/small/peli_question_small.png",
          false
        ),
        createElement("br"),
        createElement(
          "div",
          {
            style: "display: flex; align-self: center",
          },
          [
            tipBox(
              "usernames are not unique to a specific user. You can update yours at anytime.",
              "/assets/peli/small/peli_note_small.png",
              true
            ),
            createElement(
              "div",
              { class: "component", style: "align-self: flex-start;" },
              [
                createElement(
                  "h2",
                  { style: "text-decoration: underline;" },
                  "General Info"
                ),
                createElement("br"),
                this.renderEmailOrEditEmail(),
                createElement("br"),
                this.renderUsernameOrEditUsername(),
                createElement("br"),
                createElement(
                  "div",
                  { style: "display: flex; justify-content: space-between;" },
                  [
                    createElement("b", {}, "Password"),
                    createElement("button", {}, "Reset Password", {
                      type: "click",
                      event: () => {
                        window.location.pathname = "/resetpassword.html";
                      },
                    }),
                  ]
                ),
                createElement("hr"),
                createElement(
                  "h2",
                  { style: "text-decoration: underline;" },
                  "Subscriptions"
                ),
                createElement("br"),
                createElement(
                  "div",
                  { style: "text-align: center" },
                  "Coming Soon!"
                ),
              ]
            ),
          ]
        ),
      ])
    );
  };
}

const accountManager = new AccountManager();
export default accountManager;
