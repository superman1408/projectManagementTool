import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load roles.json dynamically
const rolesPath = path.join(__dirname, "roles.json");
const roles = JSON.parse(fs.readFileSync(rolesPath, "utf-8"));



export function authorize(role, level, permission) {
  const levelRoles = roles[level];
  const roleData = levelRoles?.[role];
  const hasPermission = roleData?.permissions?.[permission] || false;
  return hasPermission;
}

export default roles;