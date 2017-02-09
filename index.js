var inquirer = require('inquirer')
const moment = require('moment')
const Promise = require('bluebird')
require('colors')
const currentYear = moment().year()
const years = []
const createCoursesFile = require('./createCoursesFile.js')

console.log(`
  Detta är ett program för att ta
  fram alla kurser och studenter under en
  viss period ur KTHs system
  och spara dem i csv-filer, för import till Canvas LMS`.greenBG)

for (var i = -2; i < 4; i++) {
  years.push(`${currentYear + i}`)
}

const terms = [
  {
    name: 'Hösttermin',
    value: '1'},
  {
    name: 'Vårtermin',
    value: '2'
  }]
const periods = ['1', '2', '3', '4', '5', '6']

inquirer.prompt([
  {
    message: 'Välj år',
    name: 'year',
    choices: years,
    type: 'list',
    default: `${currentYear}`
  },
  {
    message: 'Välj termin',
    name: 'term',
    choices: terms,
    type: 'list'
  },
  {
    message: 'Välj period',
    name: 'period',
    choices: periods,
    type: 'list'
  }
])
.then(({year, term, period}) => {
  console.log('ok, börjar med att skapa csvfil med kurserna...'.green)
  return createCoursesFile({year, term, period})
    .then(() => {
      console.log('Och nu skapar vi fil med enrollments'.green)
      return Promise.reject('TODO: call enrollments!'.red)
    })
})
.then(()=>console.log('😀 Done!'.green))
.catch(e => console.error(e))