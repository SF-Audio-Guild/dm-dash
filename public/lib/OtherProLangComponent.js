import { deleteThing, getThings, postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

export default class OtherProLangComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.general_id = props.general_id;

    this.newLoading = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  newOtherProLang = async () => {
    this.toggleNewLoading();
    const res = await postThing("/api/add_5e_character_other_pro_lang", {
      general_id: this.general_id,
      type: null,
      proficiency: "New Proficiency",
    });
    this.toggleNewLoading();
  };

  renderTypeSelectOptions = (currentType) => {
    const types = ["Language", "Weapon", "Armor", "Other"];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement(
        "option",
        { class: "select-option-small", value: type },
        type
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  renderOtherProLangElems = async () => {
    const otherProLangsData = await getThings(
      `/api/get_5e_character_other_pro_langs/${this.general_id}`
    );
    if (!otherProLangsData.length)
      return [createElement("small", {}, "None...")];

    return otherProLangsData.map((item) => {
      return createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;",
        },
        [
          createElement(
            "select",
            {
              class: "select-option-small",
              id: "type",
              name: "type",
              style: "margin-right: 10px;",
            },
            [
              createElement("option", { value: "None" }, "None"),
              ...this.renderTypeSelectOptions(item.type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_other_pro_lang/${item.id}`, {
                  type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              name: "name",
              value: item.proficiency ? item.proficiency : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_other_pro_lang/${item.id}`, {
                  proficiency: e.target.value,
                });
              },
            }
          ),
          createElement(
            "div",
            {
              style: "color: var(--red1); margin-left: 10px; cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${item.proficiency}`
                  )
                ) {
                  deleteThing(
                    `/api/remove_5e_character_other_pro_lang/${item.id}`
                  );
                  e.target.parentElement.remove();
                }
              },
            }
          ),
        ]
      );
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    this.domComponent.append(
      createElement(
        "div",
        { style: "align-self: center;" },
        "Other Proficiencies & Languages"
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between;",
        },
        [
          createElement("small", {}, "Type"),
          createElement("small", {}, "Proficiency"),
          createElement("small", {}, ""),
        ]
      ),
      createElement("br"),
      ...(await this.renderOtherProLangElems()),
      createElement("a", { style: "align-self: flex-start;" }, "+", {
        type: "click",
        event: this.newOtherProLang,
      })
    );
  };
}