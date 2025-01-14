import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import createElement from "../createElement.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import getDataByQuery from "../../lib/getDataByQuery.js";

// load spells for suggestions on input
let spellSuggestions = [];
fetch("/lib/data/5e-srd-spells.json")
  .then((res) => res.json())
  .then((data) => {
    spellSuggestions = data;
  });

export default class SpellsComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.general_id = props.general_id;
    this.generalData = props.generalData;
    this.updateSpellSlotValue = props.updateSpellSlotValue;
    this.calculateSpellSaveDC = props.calculateSpellSaveDC;
    this.calculateSpellAttackBonus = props.calculateSpellAttackBonus;

    this.newLoading = false;
    this.render();
  }

  renderSpellSlotsElems = () => {
    const list = [
      {
        title: "First level",
        totalKey: "first_total",
        expendedKey: "first_expended",
      },
      {
        title: "Second level",
        totalKey: "second_total",
        expendedKey: "second_expended",
      },
      {
        title: "Third level",
        totalKey: "third_total",
        expendedKey: "third_expended",
      },
      {
        title: "Fourth level",
        totalKey: "fourth_total",
        expendedKey: "fourth_expended",
      },
      {
        title: "Fifth level",
        totalKey: "fifth_total",
        expendedKey: "fifth_expended",
      },
      {
        title: "Sixth level",
        totalKey: "sixth_total",
        expendedKey: "sixth_expended",
      },
      {
        title: "Seventh level",
        totalKey: "seventh_total",
        expendedKey: "seventh_expended",
      },
      {
        title: "Eighth level",
        totalKey: "eighth_total",
        expendedKey: "eighth_expended",
      },
      {
        title: "Nineth level",
        totalKey: "nineth_total",
        expendedKey: "nineth_expended",
      },
    ];

    return list.map((spellSlot) => {
      const elem = createElement("div");
      elem.className = "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded

      new SingleSpell({
        domComponent: elem,
        general_id: this.general_id,
        generalData: this.generalData,
        spellSlot: spellSlot,
        updateSpellSlotValue: this.updateSpellSlotValue,
        isCantrip: false,
      });
      return elem;
    });
  };

  renderCantrip = () => {
    const elem = createElement("div");
    elem.className = "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded

    new SingleSpell({
      domComponent: elem,
      general_id: this.general_id,
      spellSlot: { title: "cantrip" },
      generalData: this.generalData,
      updateSpellSlotValue: this.updateSpellSlotValue,
      isCantrip: true,
    });
    return elem;
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    const spellInfoComponent = new SpellInfoComponent({
      domComponent: createElement("div"),
      generalData: this.generalData,
      updateSpellSlotValue: this.updateSpellSlotValue,
      calculateAbilityScoreModifier: this.calculateAbilityScoreModifier,
      calculateProBonus: this.calculateProBonus,
      calculateSpellSaveDC: this.calculateSpellSaveDC,
      calculateSpellAttackBonus: this.calculateSpellAttackBonus,
    });

    this.domComponent.append(
      createElement("div", {}, [
        spellInfoComponent.domComponent,
        createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
          this.renderCantrip(),
          ...this.renderSpellSlotsElems(),
        ]),
      ])
    );
  };
}

class SpellInfoComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateSpellSlotValue = props.updateSpellSlotValue;
    this.calculateSpellSaveDC = props.calculateSpellSaveDC;
    this.calculateSpellAttackBonus = props.calculateSpellAttackBonus;

    this.render();
  }

  renderTypeSelectOptions = (currentType) => {
    const types = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ];
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

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", {}, [
        createElement(
          "div",
          {
            class: "cp-info-container-row",
            style: "width: fit-content; align-items: flex-start;",
          },
          [
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-direction: column; align-items: center; justify-content: center;",
              },
              [
                createElement(
                  "small",
                  { style: "margin-bottom: 8px;" },
                  "Spell Casting Ability"
                ),
                createElement(
                  "select",
                  {
                    id: "spell_casting_ability",
                    name: "spell_casting_ability",
                    style:
                      "margin-right: var(--main-distance); width: fit-content",
                  },
                  [
                    createElement("option", { value: "None" }, "None"),
                    ...this.renderTypeSelectOptions(
                      this.generalData.spell_slots.spell_casting_ability
                    ),
                  ],
                  {
                    type: "change",
                    event: (e) => {
                      e.preventDefault();
                      this.updateSpellSlotValue(
                        "spell_casting_ability",
                        e.target.value
                      );
                      this.render();
                    },
                  }
                ),
              ]
            ),
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-direction: column; align-items: center; margin-right: var(--main-distance); margin-left: var(--main-distance);",
              },
              [
                createElement("small", {}, "Spell Save DC"),
                createElement(
                  "div",
                  {
                    class: "cp-content-long-number",
                  },
                  this.calculateSpellSaveDC()
                ),
              ]
            ),
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-direction: column; align-items: center; justify-content: center;",
              },
              [
                createElement("small", {}, "Spell Attack Bonus"),
                createElement(
                  "div",
                  {
                    class: "cp-content-long-number",
                  },
                  `+${this.calculateSpellAttackBonus()}`
                ),
              ]
            ),
          ]
        ),
      ])
    );
  };
}

class SingleSpell {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.general_id = props.general_id;
    this.spellSlot = props.spellSlot;
    this.generalData = props.generalData;
    this.updateSpellSlotValue = props.updateSpellSlotValue;
    this.isCantrip = props.isCantrip;

    this.spells = [];

    this.spellElements = [];

    // UI based state
    this.newLoading = false;

    this.expendedElement = new ExpendedElement({
      domComponent: createElement("div"),
      totalSpellSlotCount: parseInt(
        this.generalData.spell_slots[this.spellSlot.totalKey]
      ),
      expendedSpellSlotCount: parseInt(
        this.generalData.spell_slots[this.spellSlot.expendedKey]
      ),
      expendedKey: this.spellSlot.expendedKey,
      updateSpellSlotValue: this.updateSpellSlotValue,
    });

    this.init();
  }

  init = async () => {
    // init spells
    const spells = await getThings(
      `/api/get_5e_character_spells/${this.general_id}/${this.spellSlot.title}`
    );
    if (spells.length) this.spells = spells;

    this.render();
  };

  toggleLoadingNewSpell = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  newSpell = async (type) => {
    this.toggleLoadingNewSpell();

    const spellData = await postThing("/api/add_5e_character_spell", {
      general_id: this.general_id,
      type,
      title: "New Spell",
      description: "Write spell details here...",
    });
    if (spellData) {
      const elem = createElement("div");
      const spellElement = new SingleSpellElement({
        domComponent: elem,
        id: spellData.id,
        title: spellData.title,
        castingTime: spellData.casting_time,
        duration: spellData.duration,
        range: spellData.range,
        damgeType: spellData.damage_type,
        components: spellData.components,
        description: spellData.description,
        parentRemoveItem: this.removeItem,
      });
      // update local state
      this.spells.push(spellData);
      // save the elems
      this.spellElements.push(spellElement);
    }
    this.toggleLoadingNewSpell();
  };

  removeItem = (id) => {
    this.spellElements = this.spellElements.filter((item) => item.id != id);
    this.render();
  };

  renderSpells = () => {
    if (!this.spells.length)
      return [createElement("small", {}, "No spells yet...")];

    // check if we have some components instantiated already
    if (this.spellElements.length) {
      return this.spellElements.map((item) => item.domComponent);
    }

    return this.spells.map((spell) => {
      const elem = createElement("div");
      const spellElem = new SingleSpellElement({
        domComponent: elem,
        id: spell.id,
        title: spell.title,
        castingTime: spell.casting_time,
        duration: spell.duration,
        range: spell.range,
        damageType: spell.damage_type,
        components: spell.components,
        description: spell.description,
        parentRemoveItem: this.removeItem,
      });

      this.spellElements.push(spellElem);

      return elem;
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading

    if (this.newLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Creating New Spell...")
      );
    }

    if (this.isCantrip) {
      return this.domComponent.append(
        createElement("div", { class: "special-font" }, "Cantrips"),
        createElement(
          "a",
          { style: "font-size: small; margin-top: 5px;" },
          "+ Expand all",
          {
            type: "click",
            event: () => {
              this.spellElements.forEach((spell) => spell.show());
            },
          }
        ),
        createElement(
          "a",
          { style: "font-size: small; margin-top: 5px;" },
          "- Collapse all",
          {
            type: "click",
            event: () => {
              this.spellElements.forEach((spell) => spell.hide());
            },
          }
        ),
        createElement("hr"),
        ...this.renderSpells(),
        createElement(
          "a",
          {
            style: "align-self: flex-start;",
            title: "Create a new cantrip",
          },
          "+",
          {
            type: "click",
            event: () => this.newSpell("cantrip"),
          }
        )
      );
    }

    this.domComponent.append(
      createElement("div", { class: "special-font" }, this.spellSlot.title),
      createElement(
        "a",
        { style: "font-size: small; margin-top: 5px;" },
        "+ Expand all",
        {
          type: "click",
          event: () => {
            this.spellElements.forEach((spell) => spell.show());
          },
        }
      ),
      createElement(
        "a",
        { style: "font-size: small; margin-top: 5px;" },
        "- Collapse all",
        {
          type: "click",
          event: () => {
            this.spellElements.forEach((spell) => spell.hide());
          },
        }
      ),
      createElement("div", { class: "cp-content-container-center" }, [
        createElement(
          "div",
          {
            style:
              "display: flex; align-items: center; justify-content: center;",
          },
          [
            createElement("small", {}, "Total"),
            createElement(
              "input",
              {
                class: "cp-input-no-border-small",
                name: this.spellSlot.totalKey,
                type: "number",
                max: "10",
                value: this.generalData.spell_slots[this.spellSlot.totalKey]
                  ? this.generalData.spell_slots[this.spellSlot.totalKey]
                  : "0",
              },
              null,
              [
                {
                  type: "focusout",
                  event: (e) => {
                    this.updateSpellSlotValue(
                      e.target.name,
                      e.target.valueAsNumber ? e.target.valueAsNumber : 0
                    );
                    // reset expended
                    this.updateSpellSlotValue(this.spellSlot.expendedKey, 0);
                  },
                },
                {
                  type: "input",
                  event: (e) => {
                    // update expended UI
                    const newVal = e.target.valueAsNumber;
                    this.expendedElement.totalSpellSlotCount = newVal
                      ? newVal
                      : 0;
                    this.expendedElement.expendedSpellSlotCount = 0;
                    this.expendedElement.elems = [];
                    this.expendedElement.render();
                  },
                },
              ]
            ),
          ]
        ),
        createElement("small", {}, "Expended"),
        createElement(
          "div",
          {
            style:
              "display: flex; align-items: center; justify-content: center;",
          },
          this.expendedElement.domComponent
        ),
      ]),
      createElement("hr"),
      ...this.renderSpells(),
      createElement(
        "a",
        {
          style: "align-self: flex-start;",
          title: "Create a new spell",
        },
        "+",
        {
          type: "click",
          event: () => this.newSpell(this.spellSlot.title),
        }
      )
    );
  };
}

class SingleSpellElement {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.id = props.id;
    this.title = props.title;
    this.castingTime = props.castingTime;
    this.duration = props.duration;
    this.range = props.range;
    this.damageType = props.damageType;
    this.components = props.components;
    this.description = props.description;
    this.parentRemoveItem = props.parentRemoveItem;

    this.hidden = false;

    this.render();
  }

  hide = () => {
    this.hidden = true;
    this.render();
  };

  show = () => {
    this.hidden = false;
    this.render();
  };

  toggleHide = () => {
    this.hidden = !this.hidden;
    this.render();
  };

  renderHideSpellButton = () => {
    if (!this.hidden) {
      return createElement("a", { style: "font-size: small;" }, "- Collapse", {
        type: "click",
        event: this.toggleHide,
      });
    } else {
      return createElement("a", { style: "font-size: small;" }, "+ Expand", {
        type: "click",
        event: this.toggleHide,
      });
    }
  };

  resetSpellInfoToCurrentValues = () => {
    const titleInput = document.getElementById(`spell-title-input-${this.id}`);
    const castingTimeInput = document.getElementById(
      `spell-casting-time-input-${this.id}`
    );
    const durationInput = document.getElementById(
      `spell-duration-input-${this.id}`
    );
    const rangeInput = document.getElementById(`spell-range-input-${this.id}`);
    const damageTypeInput = document.getElementById(
      `spell-damage-type-input-${this.id}`
    );
    const componentsInput = document.getElementById(
      `spell-components-input-${this.id}`
    );
    const descriptionInput = document.getElementById(
      `spell-description-input-${this.id}`
    );
    titleInput.value = this.title;
    castingTimeInput.value = this.castingTime;
    durationInput.value = this.duration;
    rangeInput.value = this.range;
    damageTypeInput.value = this.damageType;
    componentsInput.value = this.components;
    descriptionInput.value = this.description;
  };

  resetAndHideSpellSuggestions() {
    const suggElem = document.getElementById(`suggestions-spells-${this.id}`);
    suggElem.innerHTML = "";
    suggElem.appendChild(renderLoadingWithMessage());
    suggElem.style.display = "none";
  }

  saveAllSpellInfo = () => {
    // first save to local state
    const titleInput = document.getElementById(`spell-title-input-${this.id}`);
    const castingTimeInput = document.getElementById(
      `spell-casting-time-input-${this.id}`
    );
    const durationInput = document.getElementById(
      `spell-duration-input-${this.id}`
    );
    const rangeInput = document.getElementById(`spell-range-input-${this.id}`);
    const damageTypeInput = document.getElementById(
      `spell-damage-type-input-${this.id}`
    );
    const componentsInput = document.getElementById(
      `spell-components-input-${this.id}`
    );
    const descriptionInput = document.getElementById(
      `spell-description-input-${this.id}`
    );

    this.title = titleInput.value;
    this.castingTime = castingTimeInput.value;
    this.duration = durationInput.value;
    this.range = rangeInput.value;
    this.damageType = damageTypeInput.value;
    this.components = componentsInput.components;
    this.description = descriptionInput.value;

    // then save to db
    postThing(`/api/edit_5e_character_spell/${this.id}`, {
      title: titleInput.value,
      casting_time: castingTimeInput.value,
      duration: durationInput.value,
      range: rangeInput.value,
      damage_type: damageTypeInput.value,
      components: componentsInput.value,
      description: descriptionInput.value,
    });
  };

  populateSpellInfoWithSuggestion = async (item) => {
    // show data inside inputs
    const titleInput = document.getElementById(`spell-title-input-${this.id}`);
    const castingTimeInput = document.getElementById(
      `spell-casting-time-input-${this.id}`
    );
    const durationInput = document.getElementById(
      `spell-duration-input-${this.id}`
    );
    const rangeInput = document.getElementById(`spell-range-input-${this.id}`);
    const damageTypeInput = document.getElementById(
      `spell-damage-type-input-${this.id}`
    );
    const componentsInput = document.getElementById(
      `spell-components-input-${this.id}`
    );
    const descriptionInput = document.getElementById(
      `spell-description-input-${this.id}`
    );
    titleInput.value = item.name;
    if (item.casting_time) castingTimeInput.value = item.casting_time;
    if (item.duration) durationInput.value = item.duration;
    if (item.range) rangeInput.value = item.range;
    if (
      item.damage &&
      item.damage.damage_type &&
      item.damage.damage_type.name
    ) {
      damageTypeInput.value = item.damage.damage_type.name;
    } else damageTypeInput.value = "";
    if (item.components) componentsInput.value = item.components;
    if (item.desc) descriptionInput.value = item.desc.join("");
  };

  showSpellSuggestions = (e) => {
    const suggElem = document.getElementById(`suggestions-spells-${this.id}`);
    suggElem.style.display = "block";
    // suggestion position relative the current component
    // Get the bounding box of the target element
    const rect = e.target.getBoundingClientRect();
    // Set the position of the suggestion element
    suggElem.style.top = rect.bottom + window.scrollY + "px"; // You can add an offset here
    suggElem.style.left = rect.left + window.scrollX + "px"; // You can add an offset here

    if (spellSuggestions.length) {
      // clear
      suggElem.innerHTML = "";
      // get suggestions form data
      const searchSuggestionsList = getDataByQuery(
        spellSuggestions,
        e.target.value
      );
      // populate list
      for (const item of searchSuggestionsList) {
        const elem = createElement(
          "div",
          { class: "suggestions-item" },
          item.name,
          [
            {
              type: "mouseover",
              event: (e) => {
                e.preventDefault();
                this.populateSpellInfoWithSuggestion(item);
              },
            },
            {
              type: "mousedown",
              event: (e) => {
                e.preventDefault();
                this.populateSpellInfoWithSuggestion(item);
                // save spell info to local state and db
                this.saveAllSpellInfo();
                // hide
                this.resetAndHideSpellSuggestions();
              },
            },
          ]
        );
        suggElem.appendChild(elem);
      }
    }
  };

  renderSpellElemDescriptionsOrHidden = () => {
    if (!this.hidden) {
      return [
        createElement("div", { class: "cp-content-container-row" }, [
          createElement("small", {}, "Casting Time"),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              id: `spell-casting-time-input-${this.id}`,
              name: "casting_time",
              value: this.castingTime ? this.castingTime : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_spell/${this.id}`, {
                  casting_time: e.target.value,
                });
                // update UI
                this.castingTime = e.target.value;
              },
            }
          ),
        ]),
        createElement("div", { class: "cp-content-container-row" }, [
          createElement("small", {}, "Duration"),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              id: `spell-duration-input-${this.id}`,
              name: "duration",
              value: this.duration ? this.duration : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_spell/${this.id}`, {
                  duration: e.target.value,
                });
                // update UI
                this.duration = e.target.value;
              },
            }
          ),
        ]),
        createElement("div", { class: "cp-content-container-row" }, [
          createElement("small", {}, "Range"),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              id: `spell-range-input-${this.id}`,
              name: "range",
              value: this.range ? this.range : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_spell/${this.id}`, {
                  range: e.target.value,
                });
                // update UI
                this.range = e.target.value;
              },
            }
          ),
        ]),
        createElement("div", { class: "cp-content-container-row" }, [
          createElement("small", {}, "Damage Type"),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              id: `spell-damage-type-input-${this.id}`,
              name: "damage_type",
              value: this.damageType ? this.damageType : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_spell/${this.id}`, {
                  damage_type: e.target.value,
                });
                // update UI
                this.damageType = e.target.value;
              },
            }
          ),
        ]),
        createElement("div", { class: "cp-content-container-row" }, [
          createElement("small", {}, "Components"),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              id: `spell-components-input-${this.id}`,
              name: "components",
              value: this.components ? this.components : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_spell/${this.id}`, {
                  components: e.target.value,
                });
                // update UI
                this.components = e.target.value;
              },
            }
          ),
        ]),
        createElement("br"),
        createElement(
          "textarea",
          {
            class: "cp-input-gen input-small",
            id: `spell-description-input-${this.id}`,
            style: "height: 100px;",
            name: "description",
          },
          this.description ? this.description : "",
          {
            type: "focusout",
            event: (e) => {
              e.preventDefault();
              postThing(`/api/edit_5e_character_spell/${this.id}`, {
                description: e.target.value,
              });
              // update UI
              this.description = e.target.value;
            },
          }
        ),
      ];
    } else return [createElement("div", { style: "display: none;" })];
  };

  renderSuggestionElem = () => {
    document.body.appendChild(
      createElement(
        "div",
        { class: "suggestions", id: `suggestions-spells-${this.id}` },
        renderLoadingWithMessage(),
        {
          type: "mouseout",
          event: (e) => {
            e.preventDefault();
            if (e.target.childNodes.length) {
              this.resetSpellInfoToCurrentValues();
            }
          },
        }
      )
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";

    // dynamically create suggestion divs on document body
    this.renderSuggestionElem();

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex-direction: column;",
        },
        [
          createElement(
            "div",
            {
              style: "display: flex; align-items: center; margin-bottom: 5px;",
            },
            [
              createElement(
                "input",
                {
                  class: "cp-input-gen",
                  id: `spell-title-input-${this.id}`,
                  style: "color: var(--orange2);",
                  name: "title",
                  value: this.title ? this.title : "",
                },
                null,
                [
                  {
                    type: "focusin",
                    event: (e) => {
                      e.preventDefault();
                      this.showSpellSuggestions(e);
                    },
                  },
                  {
                    type: "focusout",
                    event: (e) => {
                      e.preventDefault();
                      // hide suggestions
                      this.resetAndHideSpellSuggestions();
                      // send data
                      postThing(`/api/edit_5e_character_spell/${this.id}`, {
                        title: e.target.value,
                      });
                      // update UI
                      this.title = e.target.value;
                    },
                  },
                  {
                    type: "input",
                    event: (e) => {
                      e.preventDefault();
                      this.showSpellSuggestions(e);
                    },
                  },
                ]
              ),
              createElement(
                "div",
                {
                  style:
                    "color: var(--red1); margin-left: var(--main-distance); cursor: pointer;",
                  title: "Remove spell",
                },
                "ⓧ",
                {
                  type: "click",
                  event: (e) => {
                    e.preventDefault();
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${this.title}`
                      )
                    ) {
                      deleteThing(`/api/remove_5e_character_spell/${this.id}`);
                      this.parentRemoveItem(this.id);
                    }
                  },
                }
              ),
            ]
          ),
          this.renderHideSpellButton(),
          ...this.renderSpellElemDescriptionsOrHidden(),
          createElement("hr"),
        ]
      )
    );
  };
}

class ExpendedElement {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.style =
      "display: flex; align-items: center; justify-content: center; flex-wrap: wrap;";
    this.totalSpellSlotCount = props.totalSpellSlotCount;
    this.expendedSpellSlotCount = props.expendedSpellSlotCount;
    this.expendedKey = props.expendedKey;
    this.updateSpellSlotValue = props.updateSpellSlotValue;

    this.elems = [];

    this.render();
  }

  createElems = () => {
    if (this.totalSpellSlotCount <= 0) {
      return [createElement("small", {}, "")];
    }

    let expendedElems = [];
    for (var i = 0; i < this.totalSpellSlotCount; i++) {
      const elem = createElement("div", {
        class: "expended-slot-radio",
        id: `expended-slot-${this.expendedKey}-${i}`,
      });
      expendedElems.push(elem);
    }

    if (expendedElems.length && this.expendedSpellSlotCount > 0) {
      // MISC self correction
      if (this.expendedSpellSlotCount > this.totalSpellSlotCount) {
        this.expendedSpellSlotCount = expendedElems.length;
      }

      // check expended boxes
      for (var i = 0; i < this.expendedSpellSlotCount; i++) {
        if (expendedElems[i]) {
          expendedElems[i].checked = true;
          expendedElems[i].className = "expended-slot-radio-checked";
        }
      }
    }

    // add event listeners
    expendedElems = expendedElems.map((elem) => {
      elem.addEventListener("click", (e) => {
        // update state
        if (elem.checked) {
          this.expendedSpellSlotCount--;
          elem.className = "expended-slot-radio";
          elem.checked = false;
        } else {
          this.expendedSpellSlotCount++;
          elem.className = "expended-slot-radio-checked";
          elem.checked = true;
        }
        // update db
        // careful with inputs
        if (
          this.expendedSpellSlotCount <= this.totalSpellSlotCount &&
          this.expendedSpellSlotCount >= 0
        ) {
          this.updateSpellSlotValue(
            this.expendedKey,
            this.expendedSpellSlotCount
          );

          this.render();
        }
      });
      return elem;
    });

    return expendedElems;
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (!this.elems.length) {
      this.elems = this.createElems();
    }

    this.domComponent.append(...this.elems);
  };
}
