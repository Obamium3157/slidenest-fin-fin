import { Client, Account, TablesDB, Storage } from "appwrite";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  assertAppwriteEnv,
} from "./appwriteIds.ts";

assertAppwriteEnv();

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const tablesDB = new TablesDB(client);
const storage = new Storage(client);

export { client, account, tablesDB, storage };
