// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // Fix __dirname in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load roles.json dynamically
// const rolesPath = path.join(__dirname, "roles.json");
// const roles = JSON.parse(fs.readFileSync(rolesPath, "utf-8"));

// /**
//  * Check permission inside controller and return 401/403 if unauthorized
//  * @param {string} role - user's role (e.g., "admin")
//  * @param {string} level - "workspaceRoles" or "projectRoles"
//  * @param {string} permission - permission string (e.g., "member:invite")
//  * @param {object} res - Express response object
//  */
// export function authorize(role, level, permission, res) {
//   const levelRoles = roles[level];
//   if (!levelRoles) {
//     console.warn(`⚠️ Unknown level: "${level}"`);
//     return res.status(401).json({ message: "Invalid access level" });
//   }

//   const roleData = levelRoles[role];
//   if (!roleData) {
//     console.warn(`⚠️ Unknown role: "${role}" in level "${level}"`);
//     return res.status(403).json({ message: "You are not authorized" });
//   }

//   const hasPermission = roleData.permissions?.[permission];
//   if (!hasPermission) {
//     return res
//       .status(403)
//       .json({ message: "You are not authorized to perform this action" });
//   }

//   // Authorized → return true to continue execution
//   return true;
// }

// export default roles;


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load roles.json dynamically
const rolesPath = path.join(__dirname, "roles.json");
const roles = JSON.parse(fs.readFileSync(rolesPath, "utf-8"));

/**
 * Check permission and return true/false
 * @param {string} role - user's role (e.g., "admin")
 * @param {string} level - "workspaceRoles" or "projectRoles"
 * @param {string} permission - permission string (e.g., "member:invite")
 * @returns {boolean}
 */
export function authorize(role, level, permission) {
  const levelRoles = roles[level];
  const roleData = levelRoles?.[role];
  const hasPermission = roleData?.permissions?.[permission] || false;
  return hasPermission;
}

export default roles;
