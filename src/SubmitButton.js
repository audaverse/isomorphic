import React, { useEffect } from "react";
import "./App.css";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import FS from "@isomorphic-git/lightning-fs";
import oldBlogs from "./blogs.json";

const fs = new FS("fs", { wipe: true });
const pfs = fs.promises;
const dir = "/";
const fileName = "src/blogs.json";

const SubmitButton = ({ form }) => {
  const { username, password, ...blog } = form;
  useEffect(() => {
    git
      .clone({
        fs,
        http,
        dir,
        corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/audaverse/isomorphic",
        singleBranch: true,
        depth: 1,
      })
      .then(() => console.log("cloned successfully"));
  }, []);

  return (
    <div className="Admin">
      <button
        onClick={async () => {
          let files = await git.listFiles({ fs, dir: '/src' })
          console.log(files)
          const log = await git.log({fs, dir})
          console.log("log: " + log)
          await pfs.writeFile(
            `${dir}${fileName}`,
            JSON.stringify([blog, ...oldBlogs], null, 2),
            "utf8"
          );
          await git.add({ fs, dir, filepath: fileName });
          const status = await git.status({
            fs,
            dir,
            filepath: fileName,
          });
          console.log("file status: ", status);
          await git.commit({
            fs,
            dir,
            message: `New Blog Post at ${new Date()}`,
            author: {
              name: "Admin",
              email: "Admin@tommahle.com",
            },
          });
          await git.push({
            fs,
            http,
            dir,
            remote: "origin",
            onAuth: () => ({
              username: username,
              password: password,
            }),
            force: true,
          });
          alert(
            "Pushed successfully! The usage of this alert is an excellent example of state-of-the-art web design!"
          );
        }}
      >
        Hack the planet
      </button>
    </div>
  );
};

export default SubmitButton;
