import { CoreSecrets } from "@monitor/types";
import {
  getBooleanFromEnv,
  getNumberFromEnv,
  getStringFromEnv,
  readJSONFile,
} from "@monitor/util";

export const CORE_SERVER_NAME = getStringFromEnv(
  "CORE_SERVER_NAME",
  "Monitor Core"
);
export const SECRETS = readJSONFile("/secrets/secrets.json") as CoreSecrets;
export const LOGGER = getBooleanFromEnv("LOGGER", false);
export const PORT = getNumberFromEnv("PORT", 9000);
export const HOST = getStringFromEnv("HOST", "http://localhost:" + PORT);
export const MONGO_URL = getStringFromEnv(
  "MONGO_URL",
  "mongodb://127.0.0.1:27017/monitor"
);
export const TOKEN_EXPIRES_IN = getStringFromEnv("TOKEN_EXPIRES_IN", "7d");
export const PASSWORD_SALT_ROUNDS = getNumberFromEnv("PASSWORD_SALT_ROUNDS", 8);
export const SYSROOT = getStringFromEnv("SYSROOT", "/home/ubuntu/"); // the root folder monitor has access to, prepends volumes mounted using useSysroot
export const ROOT = "/monitor/"; // the root folder in the container that SYSROOT is mounted on
export const DEPLOYDATA_ROOT = "deployments/";
export const BUILD_REPO_PATH = ROOT + "builds/";
export const DEPLOYMENT_REPO_PATH = ROOT + "repos/";
// export const REGISTRY_URL = getStringFromEnv("REGISTRY_URL", "localhost:5000/");
export const FRONTEND_PATH = getStringFromEnv("FRONTEND_PATH", "/frontend");
export const SYSTEM_OPERATOR = "Monitor";
export const PERMISSIONS_DENY_LOG = {
  stderr: "Someone tried to access this route without appropriate permissions",
};
export const UPDATES_PER_REQUEST = getNumberFromEnv("UPDATES_PER_REQUEST", 10);
export const SERVER_CHECK_TIMEOUT = getNumberFromEnv("SERVER_CHECK_TIMEOUT", 1000);
