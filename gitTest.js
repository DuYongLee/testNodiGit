const Git = require("nodegit");
const yaml = require("yamljs");
const fs = require("fs");

const app = yaml.parse(fs.readFileSync('./app.yaml', 'utf8'));
const appPartner = yaml.parse(fs.readFileSync('./appPartner.yaml', 'utf8'));

const date = new Date();
const Year = (date.getFullYear()).toString().slice(2);
const Month = ("00" + (date.getMonth()+1)).slice(1);
const Day = date.getDate();
const Hours = date.getHours();
const Minutes = date.getMinutes();

const version = `v${Year}.${Month}.${Day}.${Hours}.${Minutes}`;

app.version = version;
appPartner.version = version;

let currentBranchName = "";

fs.writeFileSync('./app.yaml', yaml.stringify(app, 4, 2));
fs.writeFileSync('./appPartner.yaml', yaml.stringify(appPartner, 4, 2));

Git.Repository.open('./').then(repo => {
  return repo.createCommitOnHead(['gitTest.js'], Git.Signature.default(repo), Git.Signature.default(repo), 'test').then(oid => {
    repo.getCommit(oid);
  }).then(commit => {
    repo.getCurrentBranch().then(reference => {
      currentBranchName = reference.name();
    })
    repo.createTag(commit, version, 'version up tag').then(tag => {
      console.log(tag.name());
    });
  }).then(() => {
    return repo.getRemote("origin");
  // }).then(remote => {
    // return remote.push(
    //   [
    //   `${currentBranchName}:${currentBranchName}`,
    //   `refs/tags/${app.version}:refs/tags/${app.version}`
    //   ],
    //   {
    //     callbacks: {
    //       certificateCheck: () => { return 1; },
    //       credentials: (url, userName) => {
    //         return Git.Cred.sshKeyFromAgent(userName);
    //       }
    //     }
    //   }
    // );
  }).then(() => {
      console.log('remote Pushed!');
  }).catch(reason => {
      console.log(reason);
  })
})
