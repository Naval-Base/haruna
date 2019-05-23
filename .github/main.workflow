workflow "Commit" {
	on = "push"
	resolves = ["ESLint"]
}

action "ESLint" {
	uses = "iCrawl/eslint-action-marine@master"
	secrets = ["GITHUB_TOKEN"]
}
