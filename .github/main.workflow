workflow "Commit" {
	on = "push"
	resolves = ["ESLint"]
}

action "ESLint" {
	uses = "iCrawl/eslint-config-marine/.github/actions/lint"
	secrets = ["GITHUB_TOKEN"]
}
