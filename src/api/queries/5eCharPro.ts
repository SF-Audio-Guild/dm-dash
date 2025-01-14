import db from "../dbconfig";

export interface DndFiveEProModel {
  id: number,
  general_id: number,
  sv_str: boolean,
  sv_dex: boolean,
  sv_con: boolean,
  sv_int: boolean,
  sv_wis: boolean,
  sv_char: boolean,
  acrobatics: boolean,
  animal_handling: boolean,
  arcana: boolean,
  athletics: boolean,
  deception: boolean,
  history: boolean,
  insight: boolean,
  intimidation: boolean,
  investigation: boolean,
  medicine: boolean,
  nature: boolean,
  perception: boolean,
  performance: boolean,
  persuasion: boolean,
  religion: boolean,
  sleight_of_hand: boolean,
  stealth: boolean,
  survival: boolean,
  acrobatics_mod: boolean,
  animal_handling_mod: boolean,
  arcana_mod: boolean,
  athletics_mod: boolean,
  deception_mod: boolean,
  history_mod: boolean,
  insight_mod: boolean,
  intimidation_mod: boolean,
  investigation_mjod: boolean,
  medicine_mod: boolean,
  nature_mod: boolean,
  perception_mod: boolean,
  performance_mod: boolean,
  persuasion_mod: boolean,
  religion_mod: boolean,
  sleight_of_hand_mod: boolean,
  stealth_mod: boolean,
  survival_mod: boolean,

}

async function add5eCharProQuery(data: {general_id: string | number}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_proficiencies" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query<DndFiveEProModel>(query)
}

async function get5eCharProQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_proficiencies" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEProModel>(query)
}

async function get5eCharProByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_proficiencies" where general_id = $1`,
    values: [generalId]
  }
  return await db.query<DndFiveEProModel>(query)
}

async function remove5eCharProQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_proficiencies" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEProModel>(query)
}

async function edit5eCharProQuery(id: string, data: any) {
  let edits = ``
  let values = []
  let iterator = 1

  for(const [key, value] of Object.entries(data)) {
    edits += `${key} = $${iterator}, `;
    values.push(value)
    iterator++
  }

  edits = edits.slice(0, -2)
  values.push(id)

  const query = {
    text: /*sql*/ `update public."dnd_5e_character_proficiencies" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<DndFiveEProModel>(query)
}

export {
  add5eCharProQuery,
  get5eCharProByGeneralQuery,
  get5eCharProQuery,
  remove5eCharProQuery,
  edit5eCharProQuery
}