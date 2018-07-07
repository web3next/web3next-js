import VM from "..";
import { BN } from 'ethereumjs-util';
import Trie from "@w3n/merkle-patricia-tree/secure";
import util from "./runners/util";
import testing from 'ethereumjs-testing';
import fs from 'fs';
import path from 'path';

const TEST_PATH = path.join(__dirname, "../node_modules/ethereumjs-testing/tests")

const getTestsDir = async () => {
  console.log(TEST_PATH);
  return new Promise((res, rej) => {
    fs.readdir(TEST_PATH, (err, dir) => {
      if(err) {
        rej(err);
        return;
      } 
      res(dir.filter(path => path.match(/Tests$/)));
    });
  });
}

const getTestsSubDir = async (testType) => {
  return new Promise((res, rej) => {
    console.log(path.join(TEST_PATH, testType));
    fs.readdir(path.join(TEST_PATH, testType), (err, dir) => {
      if(err) {
        rej(err);
        return;
      } 
      res(dir);
    });
  });
}

const getTests = async (testType, testSubType) => {

}

describe("official general state tests", async () => {

  console.log("setup");

  const trie = new Trie();
  const vm = new VM({state: trie});
  const directories = await getTestsSubDir("GeneralStateTests");

  console.log(directories);
  test("hoge", () => {
    expect(true).toBeTruthy();
  });
});
