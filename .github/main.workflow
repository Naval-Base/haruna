workflow "commit" {
	on = "push"
	resolves = ["lint"]
}

action "lint" {
	uses = "iCrawl/eslint-action-marine@master"
	env = {
		FOLDERS = "src"
	}
	secrets = ["GITHUB_TOKEN"]
}
