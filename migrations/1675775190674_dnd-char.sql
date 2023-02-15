-- Up Migration
CREATE TABLE "public"."dnd_5e_character_general" ("id" serial,"user_id" int4 NOT NULL,"name" varchar NOT NULL,"race" varchar,"class" varchar,"level" int2,"exp" int2,"inspiration" bool NOT NULL DEFAULT 'FALSE',"initiative" float4,"speed" int2,"armor_class" int2,"current_hp" int2,"temp_hp" int2,"hit_dice" varchar,"death_saves_successes" int2,"death_saves_failures" int2,"strength" int2,"dexterity" int2,"constitution" int2,"intelligence" int2,"wisdom" int2,"charisma" int2,"max_hp" int2,"hit_dice_total" int2,"class_resource" varchar,"class_resource_total" int2,"other_resource" varchar,"other_resource_total" int2,"class_resource_title" varchar,"other_resource_title" varchar, PRIMARY KEY ("id"));
CREATE TABLE "public"."dnd_5e_character_proficiencies" ("id" serial,"general_id" int4 NOT NULL,"sv_str" bool NOT NULL DEFAULT 'FALSE',"sv_dex" bool NOT NULL DEFAULT 'FALSE',"sv_con" bool NOT NULL DEFAULT 'FALSE',"sv_int" bool NOT NULL DEFAULT 'FALSE',"sv_wis" bool NOT NULL DEFAULT 'FALSE',"sv_cha" bool NOT NULL DEFAULT 'FALSE',"acrobatics" bool NOT NULL DEFAULT 'FALSE',"animal_handling" bool NOT NULL DEFAULT 'FALSE',"arcana" bool NOT NULL DEFAULT 'FALSE',"athletics" bool NOT NULL DEFAULT 'FALSE',"deception" bool NOT NULL DEFAULT 'FALSE',"history" bool NOT NULL DEFAULT 'FALSE',"insight" bool NOT NULL DEFAULT 'FALSE',"intimidation" bool NOT NULL DEFAULT 'FALSE',"investigation" bool NOT NULL DEFAULT 'FALSE',"medicine" bool NOT NULL DEFAULT 'FALSE',"nature" bool NOT NULL DEFAULT 'FALSE',"perception" bool NOT NULL DEFAULT 'FALSE',"performance" bool NOT NULL DEFAULT 'FALSE',"persuasion" bool NOT NULL DEFAULT 'FALSE',"religion" bool NOT NULL DEFAULT 'FALSE',"sleight_of_hand" bool NOT NULL DEFAULT 'FALSE',"stealth" bool NOT NULL DEFAULT 'FALSE',"survival" bool NOT NULL DEFAULT 'FALSE', PRIMARY KEY ("id"));
CREATE TABLE "public"."dnd_5e_character_background" ("id" serial,"general_id" int4 NOT NULL,"personality_traits" varchar,"ideals" varchar,"bonds" varchar,"flaws" varchar,"backstory" varchar,"age" int2,"height" varchar,"weight" varchar,"eyes" varchar,"skin" varchar,"hair" varchar,"other_info" varchar,"background" varchar,"alignment" varchar,"appearance" varchar,"allies_and_organizations" varchar, PRIMARY KEY ("id"));
CREATE TABLE "public"."dnd_5e_character_attack" ("id" serial,"title" varchar NOT NULL,"description" varchar,"range" varchar,"damage_type" varchar,"bonus" varchar,"general_id" int4 NOT NULL, PRIMARY KEY ("id"));
CREATE TABLE "public"."dnd_5e_character_equipment" ("id" serial,"general_id" int4 NOT NULL,"title" varchar NOT NULL,"description" varchar,"quantity" float4,"weight" float4, PRIMARY KEY ("id"));
CREATE TABLE "public"."dnd_5e_character_feat_trait" ("id" serial,"type" varchar,"title" varchar NOT NULL,"description" varchar NOT NULL,"general_id" int4 NOT NULL, PRIMARY KEY ("id"));
CREATE TABLE "public"."dnd_5e_character_other_pro_lang" ("id" serial,"general_id" int4 NOT NULL,"type" varchar,"proficiency" varchar NOT NULL, PRIMARY KEY ("id"));
-- Down Migration
DROP TABLE "public"."dnd_5e_character_other_pro_lang";
DROP TABLE "public"."dnd_5e_character_general";
DROP TABLE "public"."dnd_5e_character_proficiencies";
DROP TABLE "public"."dnd_5e_character_background";
DROP TABLE "public"."dnd_5e_character_attack";
DROP TABLE "public"."dnd_5e_character_equipment";
DROP TABLE "public"."dnd_5e_character_feat_trait";