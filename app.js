require('dotenv').config()

const packageInfo = require('./package.json')
console.log(`Starting ${packageInfo.name}`)

const helpers = require('./helpers')

//require octokit rest.js
//more info at https://github.com/octokit/rest.js
const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`,
})

//set eventOwner and eventRepo based on action's env variables
const eventOwnerAndRepo = process.env.GITHUB_REPOSITORY
const eventOwner = helpers.getOwner(eventOwnerAndRepo)
const eventRepo = helpers.getRepo(eventOwnerAndRepo)

async function bulkLabelAdd() {
  try {
    //read contents of action's event.json
    const eventData = await helpers.readFilePromise('..' + process.env.GITHUB_EVENT_PATH)
    const eventJSON = JSON.parse(eventData)

    //set eventAction and eventIssueNumber
    eventAction = eventJSON.action
    eventIssueNumber = eventJSON.issue.number
    eventIssueBody = eventJSON.issue.body

    //if an issue was opened, edited, or reopened
    if (eventAction === 'opened') {
      //check if there are bulk labels
      const bulkLabels = await helpers.getBulkLabels(eventIssueBody)
      console.log('bulkLabels: ', bulkLabels)

      //if one or more bulk labels
      if (bulkLabels) {
        console.log('bulk labels found in issue...')

        const repoLabels = await helpers.getRepoLabels(octokit, eventOwner, eventRepo)

        const repoShortLabels = await helpers.addShortLabelName(repoLabels)

        for (const issueLabel of bulkLabels) {
          for (const repoLabel of repoShortLabels) {
            if (issueLabel.toLowerCase() === repoLabel.shortLabelName.toLowerCase()) {
              console.log('issue label matches repo issue; labeling...')

              helpers.addLabel(octokit, eventOwner, eventRepo, eventIssueNumber, repoLabel.name)
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

//run the function
bulkLabelAdd()

module.exports.bulkLabelAdd = bulkLabelAdd
