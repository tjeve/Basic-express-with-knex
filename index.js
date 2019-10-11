// Modules
const fs = require('fs') //allows you to access the file system
const mustache = require('mustache')

const express = require('express')
const app = express()

const log = require('./src/logging.js')
const {createCohort, getAllCohorts, getOneCohort} = require('./src/db/cohorts.js')

const port = 3100

// For Authorization
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false}))

//session middleware
const session = require('express-session')
// app.use(session({ ... }))

// Passport
const passport = require('passport')

app.use(passport.initialize())
app.use(passport.session())



// -----------------------------------------------------------------------------
// Express.js Endpoints

const homepageTemplate = fs.readFileSync('./templates/homepage.html', 'utf8')

const cohortTemplate=  fs.readFileSync('./templates/cohort.html', 'utf8')

app.use(express.urlencoded())

app.get('/', function (req, res) {
  getAllCohorts()
    .then(function (allCohorts) {
      res.send(mustache.render(homepageTemplate, { cohortsListHTML: renderAllCohorts(allCohorts) }))
    })
})

function slugify (str) {
  return str.toLowerCase()
            .replace(/\s+/g, '-')
}

console.assert('abc-xyz' === slugify('Abc Xyz'))
console.assert('aaa-bbb' === slugify('AAA      BBB'))

// Login middleware
app.get('/login', passport.authenticate('oath2', {
  session: true,
  successReturnToOrRedirect: '/'
}))

app.post('/cohorts', function (req, res) {
  const cohortTitle = req.body.title
  let slug = req.body.slug
  if (slug === '') {
    slug = slugify(cohortTitle)
  }

  const newCohort = {
    title: cohortTitle,
    slug: slug
  }

  createCohort(newCohort)
    .then(function () {
      res.send('hopefully we created your cohort <a href="/">go home</a>')
    })
    .catch(function () {
      res.status(500).send('something went wrong. waaah, waaah')
    })
})

app.get('/cohorts/:slug', function (req, res) {
  getOneCohort(req.params.slug)
    .then(function (cohort) {
      console.log(req.body)
      // res.send('<pre>' + prettyPrintJSON(cohort) + '</pre>')
      res.send(mustache.render(cohortTemplate, {CohortTitleHTML: renderCohortTitle(cohort)}))
    })
    .catch(function (err) {
      res.status(404).send('cohort not found :(')
    })
})

app.post('/cohorts/:slug', function (req, res) {
  const cohortTitle = req.body.title
  if (slug === '') {
    slug = slugify(cohortTitle)
  }
})

app.listen(port, function () {
  log.info('Listening on port ' + port + ' 👍')
})

// -----------------------------------------------------------------------------
// HTML Rendering

function renderCohort (cohort) {
  return `<li><a href="/cohorts/${cohort.slug}">${cohort.title}</a></li>`
}

function renderCohortTitle (cohort) {
  return `${cohort.title}`
}

function renderAllCohorts (allCohorts) {
  return '<ul>' + allCohorts.map(renderCohort).join('') + '</ul>'
}

// -----------------------------------------------------------------------------
// Misc

function prettyPrintJSON (x) {
  return JSON.stringify(x, null, 2)
}
