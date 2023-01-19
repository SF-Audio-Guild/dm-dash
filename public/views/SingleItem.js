import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Note from "../components/Note.js";
import locationSelect from "../lib/locationSelect.js";
import characterSelect from "../lib/characterSelect.js";
import itemTypeSelect from "../lib/itemTypeSelect.js";

export default class SingleItemView {
  constructor(props) {
    this.navigate = props.navigate;
    this.params = props.params;
    this.item = this.params.item;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingNote = false;
    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleCreatingNote = () => {
    this.creatingNote = !this.creatingNote;
    this.render();
  };

  updateCurrentLocation = (newLocationId) => {
    fetch(`${window.location.origin}/api/edit_item/${this.item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location_id: newLocationId,
      }),
    });
  };

  updateCurrentCharacter= (newCharacterId) => {
    fetch(`${window.location.origin}/api/edit_item/${this.item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: newCharacterId,
      }),
    });
  };

  newNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state.user.id;
    formProps.project_id = state.currentProject.id;

    formProps.item_id = this.item.id;
    formProps.location_id = null;
    formProps.character_id = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProps),
      });
      await res.json();
      if (res.status === 201) {
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new note...");
      console.log(err);
    }
  };

  renderCreateNewNote = async () => {
    this.domComponent.append(
      createElement(
        "div",
        { class: "component-title" },
        `Create new note for ${this.item.title}`
      ),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("br"),
          createElement("input", {
            id: "title",
            name: "title",
            placeholder: "Title",
            required: true,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement("textarea", {
            id: "description",
            name: "description",
            required: true,
            cols: "30",
            rows: "7",
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Create"),
        ],
        {
          type: "submit",
          event: async (e) => {
            await this.newNote(e);
            this.toggleCreatingNote();
          },
        }
      ),
      createElement("br"),
      createElement("button", {}, "Cancel", {
        type: "click",
        event: this.toggleCreatingNote,
      })
    );
  };

  getNotesByItem = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_notes_by_item/${state.user.id}/${this.item.id}`
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  renderItemNotes = async () => {
    let notesByItem = await this.getNotesByItem();
    return notesByItem.map((note) => {
      const elem = createElement("div", {
        id: `note-component-${note.id}`,
        class: "sub-view-component",
      });

      new Note({
        domComponent: elem,
        parentRender: this.render,
        id: note.id,
        projectId: note.project_id,
        title: note.title,
        description: note.description,
        dateCreated: note.date_created,
        locationId: note.location_id,
        characterId: note.character_id,
        itemId: note.item_id,
        navigate: this.navigate,
      });

      return elem;
    });
  };

  renderItemType = () => {
    if (this.item.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.item.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  saveItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if(formProps.type === "None") formProps.type = null;
    // update UI
    this.item.title = formProps.title;
    this.item.description = formProps.description;
    this.item.type = formProps.type;

    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_item/${this.item.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formProps),
        }
      );
      await res.json();
      if (res.status === 200) {
      } else throw new Error();
    } catch (err) {
      // window.alert("Failed to save item...");
      console.log(err);
    }
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          itemTypeSelect(null, this.item.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.item.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement(
            "textarea",
            {
              id: "description",
              name: "description",
              cols: "30",
              rows: "7",
            },
            this.item.description
          ),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            this.saveItem(e);
            this.toggleEdit();
          },
        }
      )
    );
  };

  renderEditButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", {style: "visibility: hidden;"});
    } else {
      return(
        createElement(
          "a",
          { class: "small-clickable", style: "margin-left: 3px;" },
          "Edit",
          {
            type: "click",
            event: this.toggleEdit,
          }
        )
      )
    }
  }

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    if (this.creatingNote) {
      return this.renderCreateNewNote();
    }

    // append
    this.domComponent.append(
      createElement("a", { class: "back-button" }, "← Items", {
        type: "click",
        event: () => this.navigate({ title: "items", sidebar: true }),
      }),
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", {class: "single-item-title"}, [
          this.item.title,
          this.renderItemType(),
        ]),
        createElement("img", {
          src: "../assets/item.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", {style: "display: flex; flex-wrap: wrap;"}, [
        createElement(
          "div",
          { style: "margin-right: 5px; display: flex; flex-direction: column;" },
          [
            createElement("small", {}, "Current Location"),
            await locationSelect(
              this.item.location_id,
              null,
              this.updateCurrentLocation
            ),
          ]
        ),
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            createElement("small", {}, "With Character"),
            await characterSelect(
              this.item.character_id,
              this.updateCurrentCharacter
            ),
          ]
        ),
      ]),
      createElement("br"),
      createElement("div", {}, [
        createElement(
          "div",
          { class: "single-item-subheading" },
          "Description:"
        ),
        createElement(
          "div",
          { class: "description" },
          `"${this.item.description}"`
        ),
      ]),
      createElement("br"),
      createElement("div", { class: "single-item-subheading" }, [
        "Notes:",
        createElement("button", { style: "align-self: flex-end;" }, "+ Note", {
          type: "click",
          event: () => {
            this.toggleCreatingNote();
          },
        }),
      ]),
      createElement("div", { class: "sub-view" }, [
        ...(await this.renderItemNotes()),
      ]),
      createElement("br")
    );
  };
}