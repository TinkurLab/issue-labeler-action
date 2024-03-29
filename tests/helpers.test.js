const helpers = require('../helpers')
const { Octokit } = require('@octokit/rest')

octokit = jest.fn()
octokit.authenticate = jest.fn()

describe('getOwner', () => {
  it('should return owner when passed GITHUB_REPOSITORY env variable', () => {
    const result = helpers.getOwner('tinkurlab/actions-playground')
    expect(result).toBe('tinkurlab')
  })
})

describe('getRepo', () => {
  it('should return repo when passed GITHUB_REPOSITORY env variable', () => {
    const result = helpers.getRepo('tinkurlab/actions-playground')
    expect(result).toBe('actions-playground')
  })
})

describe('getBulkLabels', () => {
  it('should return 1 bulk label if 1 bulk label exist in the issue body', async () => {
    const eventIssueBody = 'checklist\r\n- [ ] to do\r\n[bug]'
    const result = helpers.getBulkLabels(eventIssueBody)
    console.log('result: ', result)

    expect(result).toEqual(expect.arrayContaining(['bug']))
  })

  it('should return 2 bulk labels if 2 bulk labels exist in the issue body', async () => {
    const eventIssueBody = 'checklist\r\n- [ ] to do\r\n[bug, enh]'
    const result = helpers.getBulkLabels(eventIssueBody)
    console.log('result: ', result)

    expect(result).toEqual(expect.arrayContaining(['bug', 'enh']))
  })

  it('should return 0 bulk labels if 0 bulk labels exist in the issue body', async () => {
    const eventIssueBody = 'checklist\r\n- [ ] to do\r\n'
    const result = helpers.getBulkLabels(eventIssueBody)

    expect(result).toEqual(expect.arrayContaining([]))
  })
})

describe('addLabel', () => {
  it('should add label to issue', async () => {
    let octokit = {
      issues: {
        addLabels: jest.fn().mockResolvedValue({ something: 'something' }),
      },
    }

    const result = await helpers.addLabel(
      octokit,
      'tinkurlab',
      'actions-playground',
      '1',
      'Incomplete Tasks'
    )
    expect(octokit.issues.addLabels).toHaveBeenCalledTimes(1)
    expect(octokit.issues.addLabels.mock.calls[0][0].labels).toEqual(['Incomplete Tasks'])
  })
})

describe('getRepoLabels', () => {
  it('should return an array of 2 labels if 2 labels exist in repo', async () => {
    const repoLabels = [
      {
        name: 'bug',
      },
      {
        name: 'enhancement',
      },
    ]
    let octokit = {
      issues: {
        listLabelsForRepo: jest.fn().mockResolvedValue({ data: repoLabels }),
      },
    }

    const result = await helpers.getRepoLabels(octokit, 'tinkurlab', 'actions-playground')

    expect(octokit.issues.listLabelsForRepo).toHaveBeenCalledTimes(1)
    expect(result).toBe(repoLabels)
  })

  it('should return an array of 0 labels if 0 labels exist in repo', async () => {
    const repoLabels = []
    let octokit = {
      issues: {
        listLabelsForRepo: jest.fn().mockResolvedValue({ data: repoLabels }),
      },
    }

    const result = await helpers.getRepoLabels(octokit, 'tinkurlab', 'actions-playground')

    expect(octokit.issues.listLabelsForRepo).toHaveBeenCalledTimes(1)
    expect(result).toBe(repoLabels)
  })
})

describe('addShortLabelName', () => {
  it('should return an array of labels with a shortLabelName property for each label', async () => {
    const repoLabels = [
      {
        name: 'bug',
      },
      {
        name: 'enhancement',
      },
    ]

    const result = await helpers.addShortLabelName(repoLabels)

    expect(result[0].shortLabelName).toBe('bug')
  })

  it('should return an array of 0 labels if 0 labels exist in repo', async () => {
    const repoLabels = []

    const result = await helpers.addShortLabelName(repoLabels)
    expect(result.length).toBe(0)
  })
})
