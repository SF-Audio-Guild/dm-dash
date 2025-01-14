import db from "../dbconfig";

export interface ProjectInviteModel {
  id: number,
  uuid: string,
  project_id: number
}

async function addProjectInviteQuery(data: {uuid: string, project_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."ProjectInvite" (uuid, project_id) values($1,$2) returning *`,
    values: [
      data.uuid,
      data.project_id
    ]
  }
  return await db.query<ProjectInviteModel>(query)
}

async function getProjectInviteQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."ProjectInvite" where id = $1`,
    values: [id]
  }
  return await db.query<ProjectInviteModel>(query)
}

async function getProjectInviteByProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectInvite" where project_id = $1`,
    values: [projectId]
  }
  return await db.query<ProjectInviteModel>(query)
}

async function getProjectInviteByUUIDQuery(uuid: string) {
  const query = {
    text: /*sql*/ `select * from public."ProjectInvite" where uuid = $1`,
    values: [uuid]
  }
  return await db.query<ProjectInviteModel>(query)
}

async function removeProjectInviteQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."ProjectInvite" where id = $1 returning *`,
    values: [id]
  }

  return await db.query<ProjectInviteModel>(query)
}

export {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByUUIDQuery,
  getProjectInviteByProjectQuery,
  removeProjectInviteQuery
}