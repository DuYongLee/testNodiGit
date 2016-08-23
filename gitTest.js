const Git = require("nodegit");
const yaml = require("yamljs");
const fs = require("fs");

const app = yaml.parse(fs.readFileSync('./app.yaml', 'utf8'));
const appPartner = yaml.parse(fs.readFileSync('./appPartner.yaml', 'utf8'));

const pharses =  ['major', 'minor', 'patch'];
const reg = /^v(\d{1,})-(\d{1,})-(\d{1,})/;
const version = app.version;

const pharse = 'patch';
const pharseIndex = pharses.indexOf(pharse);
const changedNum = (+version.match(reg)[pharseIndex + 1] + 1).toString();

let changedIdx;
const pattern = pharses.map(function(value, idx) {
  if (value === pharse) {
    changedIdx = idx;
    return changedNum;
  } else if(changedIdx < idx) {
    return '0';
  } else {
    return '$' + (++idx);
  }
});

app.version = version.replace(reg, 'v' + pattern.join('-'));
appPartner.version = version.replace(reg, 'v' + pattern.join('-'));

fs.writeFileSync('./app.yaml', yaml.stringify(app, 4, 2));

Git.Repository.open('./').then(repo => {
  repo.getHeadCommit().then(commit => {
    return repo.createTag(commit, app.version, 'version up tag').then(tag => {
      console.log(tag.name());
    });
  }).then(() => {
    return repo.getRemote("origin");
  }).then(function(remote) {
    return remote.push(
      ["refs/heads/master:refs/heads/master"],
      {
        callbacks: {
          certificateCheck: function() { return 1; },
          credentials: function(url, userName) {
            console.log(url);
            console.log(userName);
            return Git.Cred.sshKeyFromAgent(userName);
          }
        }
      }
    );
  }).then(function() {
      console.log('remote Pushed!')
  })
  .catch(function(reason) {
      console.log(reason);
  })
})
