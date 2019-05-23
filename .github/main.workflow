workflow "Commit" {
	on = "push"
	resolves = ["ESLint Action Marine"]
}

action "ESLint Action Marine" {
	uses = "iCrawl/eslint-action-marine@master"
	secrets = ["GITHUB_TOKEN"]
}
