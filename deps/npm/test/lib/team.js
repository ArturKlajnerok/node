const t = require('tap')
const requireInject = require('require-inject')

let result = ''
const libnpmteam = {
  async add () {},
  async create () {},
  async destroy () {},
  async lsTeams () {},
  async lsUsers () {},
  async rm () {},
}
const npm = { flatOptions: {} }
const mocks = {
  libnpmteam,
  'cli-columns': a => a.join(' '),
  '../../lib/npm.js': npm,
  '../../lib/utils/output.js': (...msg) => {
    result += msg.join('\n')
  },
  '../../lib/utils/otplease.js': async (opts, fn) => fn(opts),
  '../../lib/utils/usage.js': () => 'usage instructions',
}

t.afterEach(cb => {
  result = ''
  npm.flatOptions = {}
  cb()
})

const team = requireInject('../../lib/team.js', mocks)

t.test('no args', t => {
  team([], err => {
    t.match(
      err,
      'usage instructions',
      'should throw usage instructions'
    )
    t.end()
  })
})

t.test('team add <scope:team> <user>', t => {
  t.test('default output', t => {
    team(['add', '@npmcli:developers', 'foo'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should output success result for add user')
      t.end()
    })
  })

  t.test('--parseable', t => {
    npm.flatOptions.parseable = true

    team(['add', '@npmcli:developers', 'foo'], err => {
      if (err)
        throw err

      t.matchSnapshot(
        result,
        'should output success result for parseable add user'
      )
      t.end()
    })
  })

  t.test('--json', t => {
    npm.flatOptions.json = true

    team(['add', '@npmcli:developers', 'foo'], err => {
      if (err)
        throw err

      t.deepEqual(
        JSON.parse(result),
        {
          added: true,
          team: 'npmcli:developers',
          user: 'foo',
        },
        'should output success result for add user json'
      )
      t.end()
    })
  })

  t.test('--silent', t => {
    npm.flatOptions.silent = true

    team(['add', '@npmcli:developers', 'foo'], err => {
      if (err)
        throw err

      t.deepEqual(result, '', 'should not output success if silent')
      t.end()
    })
  })

  t.end()
})

t.test('team create <scope:team>', t => {
  t.test('default output', t => {
    team(['create', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should output success result for create team')
      t.end()
    })
  })

  t.test('--parseable', t => {
    npm.flatOptions.parseable = true

    team(['create', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.matchSnapshot(
        result,
        'should output parseable success result for create team'
      )
      t.end()
    })
  })

  t.test('--json', t => {
    npm.flatOptions.json = true

    team(['create', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.deepEqual(
        JSON.parse(result),
        {
          created: true,
          team: 'npmcli:newteam',
        },
        'should output success result for create team'
      )
      t.end()
    })
  })

  t.test('--silent', t => {
    npm.flatOptions.silent = true

    team(['create', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.deepEqual(result, '', 'should not output create success if silent')
      t.end()
    })
  })

  t.end()
})

t.test('team destroy <scope:team>', t => {
  t.test('default output', t => {
    team(['destroy', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should output success result for destroy team')
      t.end()
    })
  })

  t.test('--parseable', t => {
    npm.flatOptions.parseable = true

    team(['destroy', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should output parseable result for destroy team')
      t.end()
    })
  })

  t.test('--json', t => {
    npm.flatOptions.json = true

    team(['destroy', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.deepEqual(
        JSON.parse(result),
        {
          deleted: true,
          team: 'npmcli:newteam',
        },
        'should output parseable result for destroy team'
      )
      t.end()
    })
  })

  t.test('--silent', t => {
    npm.flatOptions.silent = true

    team(['destroy', '@npmcli:newteam'], err => {
      if (err)
        throw err

      t.deepEqual(result, '', 'should not output destroy if silent')
      t.end()
    })
  })

  t.end()
})

t.test('team ls <scope>', t => {
  const libnpmteam = {
    async lsTeams () {
      return [
        'npmcli:developers',
        'npmcli:designers',
        'npmcli:product',
      ]
    },
  }

  const team = requireInject('../../lib/team.js', {
    ...mocks,
    libnpmteam,
  })

  t.test('default output', t => {
    team(['ls', '@npmcli'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list teams for a given scope')
      t.end()
    })
  })

  t.test('--parseable', t => {
    npm.flatOptions.parseable = true

    team(['ls', '@npmcli'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list teams for a parseable scope')
      t.end()
    })
  })

  t.test('--json', t => {
    npm.flatOptions.json = true

    team(['ls', '@npmcli'], err => {
      if (err)
        throw err

      t.deepEqual(
        JSON.parse(result),
        [
          'npmcli:designers',
          'npmcli:developers',
          'npmcli:product',
        ],
        'should json list teams for a scope json'
      )
      t.end()
    })
  })

  t.test('--silent', t => {
    npm.flatOptions.silent = true

    team(['ls', '@npmcli'], err => {
      if (err)
        throw err

      t.deepEqual(result, '', 'should not list teams if silent')
      t.end()
    })
  })

  t.test('no teams', t => {
    const libnpmteam = {
      async lsTeams () {
        return []
      },
    }

    const team = requireInject('../../lib/team.js', {
      ...mocks,
      libnpmteam,
    })

    team(['ls', '@npmcli'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list no teams for a given scope')
      t.end()
    })
  })

  t.test('single team', t => {
    const libnpmteam = {
      async lsTeams () {
        return ['npmcli:developers']
      },
    }

    const team = requireInject('../../lib/team.js', {
      ...mocks,
      libnpmteam,
    })

    team(['ls', '@npmcli'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list single team for a given scope')
      t.end()
    })
  })

  t.end()
})

t.test('team ls <scope:team>', t => {
  const libnpmteam = {
    async lsUsers () {
      return ['nlf', 'ruyadorno', 'darcyclarke', 'isaacs']
    },
  }
  const team = requireInject('../../lib/team.js', {
    ...mocks,
    libnpmteam,
  })

  t.test('default output', t => {
    team(['ls', '@npmcli:developers'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list users for a given scope:team')
      t.end()
    })
  })

  t.test('--parseable', t => {
    npm.flatOptions.parseable = true

    team(['ls', '@npmcli:developers'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list users for a parseable scope:team')
      t.end()
    })
  })

  t.test('--json', t => {
    npm.flatOptions.json = true

    team(['ls', '@npmcli:developers'], err => {
      if (err)
        throw err

      t.deepEqual(
        JSON.parse(result),
        [
          'darcyclarke',
          'isaacs',
          'nlf',
          'ruyadorno',
        ],
        'should list users for a scope:team json'
      )
      t.end()
    })
  })

  t.test('--silent', t => {
    npm.flatOptions.silent = true

    team(['ls', '@npmcli:developers'], err => {
      if (err)
        throw err

      t.deepEqual(result, '', 'should not output users if silent')
      t.end()
    })
  })

  t.test('no users', t => {
    const libnpmteam = {
      async lsUsers () {
        return []
      },
    }

    const team = requireInject('../../lib/team.js', {
      ...mocks,
      libnpmteam,
    })

    team(['ls', '@npmcli:developers'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list no users for a given scope')
      t.end()
    })
  })

  t.test('single user', t => {
    const libnpmteam = {
      async lsUsers () {
        return ['foo']
      },
    }

    const team = requireInject('../../lib/team.js', {
      ...mocks,
      libnpmteam,
    })

    team(['ls', '@npmcli:developers'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should list single user for a given scope')
      t.end()
    })
  })

  t.end()
})

t.test('team rm <scope:team> <user>', t => {
  t.test('default output', t => {
    team(['rm', '@npmcli:newteam', 'foo'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should output success result for remove user')
      t.end()
    })
  })

  t.test('--parseable', t => {
    npm.flatOptions.parseable = true

    team(['rm', '@npmcli:newteam', 'foo'], err => {
      if (err)
        throw err

      t.matchSnapshot(result, 'should output parseable result for remove user')
      t.end()
    })
  })

  t.test('--json', t => {
    npm.flatOptions.json = true

    team(['rm', '@npmcli:newteam', 'foo'], err => {
      if (err)
        throw err

      t.deepEqual(
        JSON.parse(result),
        {
          removed: true,
          team: 'npmcli:newteam',
          user: 'foo',
        },
        'should output json result for remove user'
      )
      t.end()
    })
  })

  t.test('--silent', t => {
    npm.flatOptions.silent = true

    team(['rm', '@npmcli:newteam', 'foo'], err => {
      if (err)
        throw err

      t.deepEqual(result, '', 'should not output rm result if silent')
      t.end()
    })
  })

  t.end()
})

t.test('completion', t => {
  const { completion } = team

  t.test('npm team autocomplete', t => {
    completion({
      conf: {
        argv: {
          remain: ['npm', 'team'],
        },
      },
    }, (err, res) => {
      if (err)
        throw err

      t.strictSame(
        res,
        ['create', 'destroy', 'add', 'rm', 'ls'],
        'should auto complete with subcommands'
      )

      t.end()
    })
  })

  t.test('npm team <subcommand> autocomplete', async t => {
    const check = (subcmd) => new Promise((res, rej) =>
      completion({
        conf: {
          argv: {
            remain: ['npm', 'team', subcmd],
          },
        },
      }, (err, response) => {
        if (err)
          rej(err)

        t.strictSame(
          response,
          [],
          `should not autocomplete ${subcmd} subcommand`
        )
        res()
      }))

    await ['create', 'destroy', 'add', 'rm', 'ls'].map(check)
  })

  t.test('npm team unknown subcommand autocomplete', t => {
    completion({
      conf: {
        argv: {
          remain: ['npm', 'team', 'missing-subcommand'],
        },
      },
    }, (err, res) => {
      t.match(
        err,
        /missing-subcommand not recognized/,
        'should throw a a not recognized error'
      )

      t.end()
    })
  })

  t.end()
})
