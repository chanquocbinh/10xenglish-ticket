ALTER TABLE "Role" ADD COLUMN "permissions_new" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Role" SET "permissions_new" = COALESCE((
  SELECT array_agg(DISTINCT np ORDER BY np)
  FROM unnest("permissions") AS p,
  LATERAL unnest(
    CASE p::text
      WHEN 'VIEW_USERS'      THEN ARRAY['users.view']
      WHEN 'MANAGE_USERS'    THEN ARRAY['users.view','users.create','users.update','users.resetPassword']
      WHEN 'MANAGE_ROLES'    THEN ARRAY['roles.view','roles.create','roles.update','roles.delete']
      WHEN 'MANAGE_SETTINGS' THEN ARRAY['settings.view','settings.update']
      WHEN 'SIGN_OFF'        THEN ARRAY['approval.view','tickets.approve','tasks.approve']
      ELSE ARRAY[]::TEXT[]
    END
  ) AS np
), ARRAY[]::TEXT[]);

ALTER TABLE "Role" DROP COLUMN "permissions";
ALTER TABLE "Role" RENAME COLUMN "permissions_new" TO "permissions";

-- Quyền nghiệp vụ cơ bản: trước refactor các trang này chỉ yêu cầu đăng nhập.
UPDATE "Role"
SET "permissions" = ARRAY(
  SELECT DISTINCT x FROM unnest(
    "permissions" || ARRAY['dashboard.view','tickets.view','tickets.create','tickets.update','tickets.comment','tasks.view','tasks.create','tasks.update','sprints.view']
  ) AS x
)
WHERE "isSystem" = false;

UPDATE "Role" SET "permissions" = ARRAY['*'] WHERE "isSystem" = true;

DROP TYPE "Permission";
