workflow "New workflow" {
  on = "push"
  resolves = ["nuxt/actions-yarn@master-1"]
}

action "nuxt/actions-yarn@master" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "nuxt/actions-yarn@master-1" {
  uses = "nuxt/actions-yarn@master"
  needs = ["nuxt/actions-yarn@master"]
  args = "build"
}
