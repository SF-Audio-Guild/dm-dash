"use strict";
var express = require("express");
var _a = require("./controllers/clocks.js"), getClocks = _a.getClocks, addClock = _a.addClock, removeClock = _a.removeClock, editClock = _a.editClock;
var _b = require("./controllers/projects.js"), getProject = _b.getProject, getProjects = _b.getProjects, addProject = _b.addProject, removeProject = _b.removeProject, editProject = _b.editProject;
var _c = require("./controllers/users.js"), getAllUsers = _c.getAllUsers, getUserById = _c.getUserById, registerUser = _c.registerUser, loginUser = _c.loginUser, verifyJwt = _c.verifyJwt, editUser = _c.editUser, resetPassword = _c.resetPassword, requestResetEmail = _c.requestResetEmail;
var _d = require("./controllers/calendars.js"), getCalendars = _d.getCalendars, addCalendar = _d.addCalendar, removeCalendar = _d.removeCalendar, editCalendar = _d.editCalendar;
var _e = require("./controllers/months.js"), getMonths = _e.getMonths, addMonth = _e.addMonth, removeMonth = _e.removeMonth, editMonth = _e.editMonth;
var _f = require("./controllers/days.js"), getDays = _f.getDays, addDay = _f.addDay, removeDay = _f.removeDay, editDay = _f.editDay;
var _g = require("./controllers/locations.js"), getLocation = _g.getLocation, getLocations = _g.getLocations, getSubLocations = _g.getSubLocations, addLocation = _g.addLocation, removeLocation = _g.removeLocation, editLocation = _g.editLocation;
var _h = require("./controllers/notes.js"), getNotes = _h.getNotes, addNote = _h.addNote, getNotesByLocation = _h.getNotesByLocation, getNotesByCharacter = _h.getNotesByCharacter, removeNote = _h.removeNote, editNote = _h.editNote, getNotesByItem = _h.getNotesByItem, getNotesByLore = _h.getNotesByLore;
var _j = require("./controllers/events.js"), getEvents = _j.getEvents, addEvent = _j.addEvent, getEventsByLocation = _j.getEventsByLocation, getEventsByCharacter = _j.getEventsByCharacter, removeEvent = _j.removeEvent, editEvent = _j.editEvent, getEventsByItem = _j.getEventsByItem, getEventsByLore = _j.getEventsByLore;
var _k = require("./controllers/counters.js"), getCounters = _k.getCounters, addCounter = _k.addCounter, removeCounter = _k.removeCounter, editCounter = _k.editCounter;
var _l = require("./controllers/characters.js"), getCharacter = _l.getCharacter, getCharacters = _l.getCharacters, getCharactersByLocation = _l.getCharactersByLocation, addCharacter = _l.addCharacter, removeCharacter = _l.removeCharacter, editCharacter = _l.editCharacter;
var _m = require("./controllers/items.js"), getItem = _m.getItem, getItems = _m.getItems, getItemsByLocation = _m.getItemsByLocation, getItemsByCharacter = _m.getItemsByCharacter, addItem = _m.addItem, removeItem = _m.removeItem, editItem = _m.editItem;
var _o = require("./controllers/projectInvites.js"), getProjectInviteByUUID = _o.getProjectInviteByUUID, addProjectInvite = _o.addProjectInvite, removeProjectInvite = _o.removeProjectInvite;
var _p = require("./controllers/projectUsers.js"), getProjectUserByUserAndProject = _p.getProjectUserByUserAndProject, getProjectUsersByProject = _p.getProjectUsersByProject, addProjectUser = _p.addProjectUser, removeProjectUser = _p.removeProjectUser, editProjectUser = _p.editProjectUser;
var _q = require("./controllers/s3.js"), getSignedUrlForDownload = _q.getSignedUrlForDownload, uploadToAws = _q.uploadToAws, removeImage = _q.removeImage, getImage = _q.getImage;
var multer = require("multer");
var _r = require("./controllers/lores.js"), getLore = _r.getLore, getLores = _r.getLores, addLore = _r.addLore, removeLore = _r.removeLore, editLore = _r.editLore;
var _s = require("./controllers/loreRelations.js"), getLoreRelation = _s.getLoreRelation, getLoreRelationsByLore = _s.getLoreRelationsByLore, getLoreRelationsByLocation = _s.getLoreRelationsByLocation, getLoreRelationsByCharacter = _s.getLoreRelationsByCharacter, getLoreRelationsByItem = _s.getLoreRelationsByItem, addLoreRelation = _s.addLoreRelation, removeLoreRelation = _s.removeLoreRelation, editLoreRelation = _s.editLoreRelation;
var _t = require("./controllers/5eCharGeneral.js"), get5eCharsByUser = _t.get5eCharsByUser, add5eChar = _t.add5eChar, remove5eChar = _t.remove5eChar, edit5eCharGeneral = _t.edit5eCharGeneral, edit5eCharPro = _t.edit5eCharPro, edit5eCharBack = _t.edit5eCharBack, get5eCharGeneral = _t.get5eCharGeneral;
var _u = require("./controllers/5eCharOtherProLang.js"), get5eCharOtherProLangsByGeneral = _u.get5eCharOtherProLangsByGeneral, add5eCharOtherProLang = _u.add5eCharOtherProLang, remove5eCharOtherProLang = _u.remove5eCharOtherProLang, edit5eCharOtherProLang = _u.edit5eCharOtherProLang;
var _v = require("./controllers/5eCharAttacks.js"), get5eCharAttacksByGeneral = _v.get5eCharAttacksByGeneral, add5eCharAttack = _v.add5eCharAttack, remove5eCharAttack = _v.remove5eCharAttack, edit5eCharAttack = _v.edit5eCharAttack;
var _w = require("./controllers/5eCharEquipment.js"), get5eCharEquipmentsByGeneral = _w.get5eCharEquipmentsByGeneral, add5eCharEquipment = _w.add5eCharEquipment, remove5eCharEquipment = _w.remove5eCharEquipment, edit5eCharEquipment = _w.edit5eCharEquipment;
var _x = require("./controllers/5eCharFeats.js"), get5eCharFeatsByGeneral = _x.get5eCharFeatsByGeneral, add5eCharFeat = _x.add5eCharFeat, remove5eCharFeat = _x.remove5eCharFeat, edit5eCharFeat = _x.edit5eCharFeat;
var edit5eCharSpellSlotInfo = require("./controllers/5eCharSpellSlots.js").edit5eCharSpellSlotInfo;
var _y = require("./controllers/5eCharSpells.js"), get5eCharSpellsByType = _y.get5eCharSpellsByType, add5eCharSpell = _y.add5eCharSpell, remove5eCharSpell = _y.remove5eCharSpell, edit5eCharSpell = _y.edit5eCharSpell;
var _z = require("./controllers/projectPlayers.js"), getProjectPlayersByProject = _z.getProjectPlayersByProject, addProjectPlayer = _z.addProjectPlayer, removeProjectPlayer = _z.removeProjectPlayer, editProjectPlayer = _z.editProjectPlayer, getProjectPlayersByPlayer = _z.getProjectPlayersByPlayer;
var _0 = require("./controllers/tableImages.js"), getTableImages = _0.getTableImages, addTableImage = _0.addTableImage, removeTableImage = _0.removeTableImage, editTableImage = _0.editTableImage;
var _1 = require("./controllers/tableViews.js"), getTableViews = _1.getTableViews, removeTableView = _1.removeTableView, editTableView = _1.editTableView, addTableView = _1.addTableView, getTableView = _1.getTableView;
var upload = multer({ dest: "file_uploads/" });
var router = express.Router();
router.get("/get_image/:id", getImage);
router.post("/signed_URL_download", getSignedUrlForDownload);
router.post("/file_upload", upload.single("file"), uploadToAws);
router["delete"]("/remove_image/:project_id/:image_id", removeImage);
router.get("/get_table_views/:project_id", getTableViews);
router.get("/get_table_view/:id", getTableView);
router.post("/add_table_view", addTableView);
router["delete"]("/remove_table_view/:id", removeTableView);
router.post("/edit_table_view/:id", editTableView);
router.get("/get_table_images/:project_id", getTableImages);
router.post("/add_table_image", addTableImage);
router["delete"]("/remove_table_image/:id", removeTableImage);
router.post("/edit_table_image/:id", editTableImage);
router.get("/get_project_players_by_project/:project_id", getProjectPlayersByProject);
router.get("/get_project_players_by_player/:player_id", getProjectPlayersByPlayer);
router.post("/add_project_player", addProjectPlayer);
router["delete"]("/remove_project_player/:id", removeProjectPlayer);
router.post("/edit_project_player/:id", editProjectPlayer);
router.get("/get_project_user_by_user_and_project/:project_id", getProjectUserByUserAndProject);
router.get("/get_project_users_by_project/:project_id", getProjectUsersByProject);
router.post("/add_project_user", addProjectUser);
router["delete"]("/remove_project_user/:id", removeProjectUser);
router.post("/edit_project_user/:id", editProjectUser);
router.get("/get_project_invite_by_uuid/:uuid", getProjectInviteByUUID);
router.post("/add_project_invite", addProjectInvite);
router["delete"]("/remove_project_invite/:id", removeProjectInvite);
router.get("/get_5e_characters_by_user", get5eCharsByUser);
router.get("/get_5e_character_general/:id", get5eCharGeneral);
router.post("/add_5e_character", add5eChar);
router["delete"]("/remove_5e_character/:id", remove5eChar);
router.post("/edit_5e_character_general/:id", edit5eCharGeneral);
router.post("/edit_5e_character_proficiencies/:id", edit5eCharPro);
router.post("/edit_5e_character_background/:id", edit5eCharBack);
router.post("/edit_5e_character_spell_slots/:id", edit5eCharSpellSlotInfo);
router.get("/get_5e_character_attacks/:general_id", get5eCharAttacksByGeneral);
router.post("/add_5e_character_attack", add5eCharAttack);
router["delete"]("/remove_5e_character_attack/:id", remove5eCharAttack);
router.post("/edit_5e_character_attack/:id", edit5eCharAttack);
router.get("/get_5e_character_spells/:general_id/:type", get5eCharSpellsByType);
router.post("/add_5e_character_spell", add5eCharSpell);
router["delete"]("/remove_5e_character_spell/:id", remove5eCharSpell);
router.post("/edit_5e_character_spell/:id", edit5eCharSpell);
router.get("/get_5e_character_feats/:general_id", get5eCharFeatsByGeneral);
router.post("/add_5e_character_feat", add5eCharFeat);
router["delete"]("/remove_5e_character_feat/:id", remove5eCharFeat);
router.post("/edit_5e_character_feat/:id", edit5eCharFeat);
router.get("/get_5e_character_equipments/:general_id", get5eCharEquipmentsByGeneral);
router.post("/add_5e_character_equipment", add5eCharEquipment);
router["delete"]("/remove_5e_character_equipment/:id", remove5eCharEquipment);
router.post("/edit_5e_character_equipment/:id", edit5eCharEquipment);
router.get("/get_5e_character_other_pro_langs/:general_id", get5eCharOtherProLangsByGeneral);
router.post("/add_5e_character_other_pro_lang", add5eCharOtherProLang);
router["delete"]("/remove_5e_character_other_pro_lang/:id", remove5eCharOtherProLang);
router.post("/edit_5e_character_other_pro_lang/:id", edit5eCharOtherProLang);
router.get("/get_events/:project_id/:limit/:offset", getEvents);
router.get("/get_events_by_location/:location_id", getEventsByLocation);
router.get("/get_events_by_character/:character_id", getEventsByCharacter);
router.get("/get_events_by_item/:item_id", getEventsByItem);
router.get("/get_events_by_lore/:lore_id", getEventsByLore);
router.post("/add_event", addEvent);
router["delete"]("/remove_event/:id", removeEvent);
router.post("/edit_event/:id", editEvent);
router.get("/get_notes/:project_id/:limit/:offset", getNotes);
router.get("/get_notes/:project_id/:limit/:offset/:keyword", getNotes);
router.get("/get_notes_by_location/:location_id", getNotesByLocation);
router.get("/get_notes_by_character/:character_id", getNotesByCharacter);
router.get("/get_notes_by_item/:item_id", getNotesByItem);
router.get("/get_notes_by_lore/:lore_id", getNotesByLore);
router.post("/add_note", addNote);
router["delete"]("/remove_note/:id", removeNote);
router.post("/edit_note/:id", editNote);
router.get("/get_lore_relation/:id", getLoreRelation);
router.get("/get_lore_relations_by_lore/:type/:id", getLoreRelationsByLore);
router.get("/get_lore_relations_by_location/:location_id", getLoreRelationsByLocation);
router.get("/get_lore_relations_by_character/:character_id", getLoreRelationsByCharacter);
router.get("/get_lore_relations_by_item/:item_id", getLoreRelationsByItem);
router.post("/add_lore_relation", addLoreRelation);
router["delete"]("/remove_lore_relation/:id", removeLoreRelation);
router.post("/edit_lore_relation/:id", editLoreRelation);
router.get("/get_lore/:id", getLore);
router.get("/get_lores/:project_id/:limit/:offset", getLores);
router.get("/get_lores_filter/:project_id/:limit/:offset/:filter", getLores);
router.get("/get_lores_keyword/:project_id/:limit/:offset/:keyword", getLores);
router.get("/get_lores_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", getLores);
router.post("/add_lore", addLore);
router["delete"]("/remove_lore/:id", removeLore);
router.post("/edit_lore/:id", editLore);
router.get("/get_item/:id", getItem);
router.get("/get_items/:project_id/:limit/:offset", getItems);
router.get("/get_items_filter/:project_id/:limit/:offset/:filter", getItems);
router.get("/get_items_keyword/:project_id/:limit/:offset/:keyword", getItems);
router.get("/get_items_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", getItems);
router.get("/get_items_by_location/:location_id", getItemsByLocation);
router.get("/get_items_by_character/:character_id", getItemsByCharacter);
router.post("/add_item", addItem);
router["delete"]("/remove_item/:id", removeItem);
router.post("/edit_item/:id", editItem);
router.get("/get_character/:id", getCharacter);
router.get("/get_characters/:project_id/:limit/:offset", getCharacters);
router.get("/get_characters_filter/:project_id/:limit/:offset/:filter", getCharacters);
router.get("/get_characters_keyword/:project_id/:limit/:offset/:keyword", getCharacters);
router.get("/get_characters_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", getCharacters);
router.get("/get_characters_by_location/:location_id", getCharactersByLocation);
router.post("/add_character", addCharacter);
router["delete"]("/remove_character/:id", removeCharacter);
router.post("/edit_character/:id", editCharacter);
router.get("/get_location/:id", getLocation);
router.get("/get_locations/:project_id/:limit/:offset", getLocations);
router.get("/get_locations_filter/:project_id/:limit/:offset/:filter", getLocations);
router.get("/get_locations_keyword/:project_id/:limit/:offset/:keyword", getLocations);
router.get("/get_locations_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", getLocations);
router.get("/get_sublocations/:parent_location_id", getSubLocations);
router.post("/add_location", addLocation);
router["delete"]("/remove_location/:id", removeLocation);
router.post("/edit_location/:id", editLocation);
router.get("/get_counters/:project_id", getCounters);
router.post("/add_counter", addCounter);
router["delete"]("/remove_counter/:id", removeCounter);
router.post("/edit_counter/:id", editCounter);
router.get("/get_months/:calendar_id", getMonths);
router.post("/add_month", addMonth);
router["delete"]("/remove_month/:id", removeMonth);
router.post("/edit_month/:id", editMonth);
router.get("/get_days/:calendar_id", getDays);
router.post("/add_day", addDay);
router["delete"]("/remove_day/:id", removeDay);
router.post("/edit_day/:id", editDay);
router.get("/get_calendars/:project_id", getCalendars);
router.post("/add_calendar", addCalendar);
router["delete"]("/remove_calendar/:id", removeCalendar);
router.post("/edit_calendar/:id", editCalendar);
router.get("/get_clocks/:project_id", getClocks);
router.post("/add_clock", addClock);
router["delete"]("/remove_clock/:id", removeClock);
router.post("/edit_clock/:id", editClock);
router.get("/get_project/:id", getProject);
router.get("/get_projects", getProjects);
router.post("/add_project", addProject);
router["delete"]("/remove_project/:id", removeProject);
router.post("/edit_project/:id", editProject);
router.get("/get_user_by_id/:id", getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify_jwt", verifyJwt);
router.post("/edit_user/:id", editUser);
router.post("/reset_password", resetPassword);
router.post("/request_reset_email", requestResetEmail);
module.exports = router;
