import db from "../dbconfig";

interface ClockModel {
  id: number,
  title: string,
  current_time_in_milliseconds: number,
  project_id: number
}

async function addClockQuery(data: {
  title: string,
  current_time_in_milliseconds: string,
  project_id: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Clock" (title, current_time_in_milliseconds, project_id) values($1,$2,$3) returning *`,
    values: [
      data.title,
      data.current_time_in_milliseconds,
      data.project_id
    ]
  }
  return await db.query<ClockModel>(query)
}

async function getClockQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Clock" where id = $1`,
    values: [id]
  }
  return await db.query<ClockModel>(query)
}

async function getClocksQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Clock" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query<ClockModel>(query)
}

async function removeClockQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Clock" where id = $1`,
    values: [id]
  }

  return await db.query<ClockModel>(query)
}

async function editClockQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."Clock" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<ClockModel>(query)
}

export {
  addClockQuery,
  getClocksQuery,
  getClockQuery,
  removeClockQuery,
  editClockQuery
}