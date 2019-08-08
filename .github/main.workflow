workflow "commit" {
  on = "push"
  resolves = ["lint"]
}

workflow "pr" {
  on = "pull_request"
  resolves = ["pr_lint"]
}

action "master" {
  uses = "actions/bin/filter@0dbb077f64d0ec1068a644d25c71b1db66148a24"
  args = "branch master"
}

action "lint" {
  needs = "master"
  uses = "iCrawl/eslint-action-marine@master"
  env = {
    FOLDERS = "src"
  }
  secrets = ["GITHUB_TOKEN"]
}

action "pr_lint" {
  uses = "iCrawl/eslint-action-marine@master"
  env = {
    FOLDERS = "src"
  }
  secrets = ["GITHUB_TOKEN"]
}

