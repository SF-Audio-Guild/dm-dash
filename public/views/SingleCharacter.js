import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Note from "../components/Note.js";

export default class SingleCharacterView {
  constructor(props) {
    this.navigate = props.navigate;
    this.params = props.params;
    this.character = this.params.character;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingNote = false;

    this.render();
  }

  toggleCreatingNote = () => {
    this.creatingNote = !this.creatingNote;
    this.render();
  };

  newNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.project_id = state.currentProject;
    formProps.location_id = null;
    formProps.character_id = this.character.id;

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
        `Create new note for ${this.character.title}`
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

  getNotesByCharacter = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_notes_by_character/${this.character.id}`
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

  renderCharacterNotes = async () => {
    let notesByCharacter = await this.getNotesByCharacter();
    return notesByCharacter.map((note) => {
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
        navigate: this.navigate,
      });

      return elem;
    });
  };

  renderCharacterType = () => {
    if (this.character.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray);" },
        this.character.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingNote) {
      return this.renderCreateNewNote();
    }

    // append
    this.domComponent.append(
      createElement("a", { class: "back-button" }, "← Characters", {
        type: "click",
        event: () => this.navigate({ title: "characters", sidebar: true }),
      }),
      createElement("div", { class: "single-item-title" }, [
        this.character.title,
        createElement("img", {
          src: "../assets/character.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderCharacterType(),
      createElement("br"),
      createElement("div", {}, [
        createElement("div", { class: "single-item-subheading" }, "Description:"),
        createElement(
          "div",
          { class: "description" },
          `"${this.character.description}"`
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
        ...(await this.renderCharacterNotes()),
      ]),
      createElement("br")
    );
  };
}