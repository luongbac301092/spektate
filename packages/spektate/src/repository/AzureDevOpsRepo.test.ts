import { AxiosResponse } from "axios";
import * as fs from "fs";
import { HttpHelper } from "../HttpHelper";
import { IAuthor } from "./Author";
import { AzureDevOpsRepo } from "./AzureDevOpsRepo";
import { ITag } from "./Tag";

let authorRawResponse = {};
let syncTagRawResponse = {};
let manifestSyncTagResponse = {};
const mockDirectory = "src/repository/mocks/";
const repo = new AzureDevOpsRepo("org", "project", "repo", "some-token");

beforeAll(() => {
  authorRawResponse = JSON.parse(
    fs.readFileSync(mockDirectory + "azdo-author-response.json", "utf-8")
  );
  syncTagRawResponse = JSON.parse(
    fs.readFileSync(mockDirectory + "azdo-sync-response.json", "utf-8")
  );
  manifestSyncTagResponse = JSON.parse(
    fs.readFileSync(
      mockDirectory + "azdo-manifest-sync-tag-response.json",
      "utf-8"
    )
  );
});
jest.spyOn(HttpHelper, "httpGet").mockImplementation(
  <T>(theUrl: string, accessToken?: string): Promise<AxiosResponse<T>> => {
    if (theUrl.includes("commits")) {
      return getAxiosResponseForObject(authorRawResponse);
    } else if (theUrl.includes("annotatedtags")) {
      return getAxiosResponseForObject(manifestSyncTagResponse);
    }
    return getAxiosResponseForObject(syncTagRawResponse);
  }
);

describe("AzureDevOpsRepo", () => {
  test("gets author correctly", async () => {
    const author = await repo.getAuthor("commit");
    expect(author).toBeDefined();
    expect(author!.name).toBe("Samiya Akhtar");
    expect(author!.url).toBeDefined();
    expect(author!.username).toBe("saakhta@microsoft.com");
    expect(author!.imageUrl).toBeTruthy();
  });
});

describe("AzureDevOpsRepo", () => {
  test("gets manifest sync tag correctly", async () => {
    const tags = await repo.getManifestSyncState();
    expect(tags).toHaveLength(1);
    expect(tags[0].commit).toBe("ab4c9f1");
    expect(tags[0].name).toBe("SYNC");
  });
});

describe("GitHub", () => {
  test("gets releases URL correctly", async () => {
    const releaseUrl = repo.getReleasesURL();
    expect(releaseUrl).toBe("https://dev.azure.com/org/project/_git/repo/tags");
  });
});

const getAxiosResponseForObject = <T>(obj: any): Promise<AxiosResponse<T>> => {
  return new Promise(resolve => {
    const response: AxiosResponse<any> = {
      config: {},
      data: obj,
      headers: "",
      status: 200,
      statusText: ""
    };
    resolve(response);
  });
};
