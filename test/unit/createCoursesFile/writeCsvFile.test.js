const test = require('tape')
const sinon = require('sinon')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../server/createCoursesFile')
const createCsvFile = createCoursesFile.__get__('createCsvFile')
const csvFile = createCoursesFile.__get__('csvFile')
csvFile.writeLine = sinon.stub()

createCoursesFile.__set__('mkdirAsync', () => Promise.resolve())

test('should write a line with the headers', t => {
  // createCoursesFile.__set__('buildCanvasCourseObjectV2', arg => [
  //   {sisCourseId: 'sisCourseId',
  //     courseCode: 'courseCode',
  //     shortName: 'shortName',
  //     longName: 'longName',
  //     startDate: 'startDate',
  //     sisAccountId: 'sisAccountId'}])
  // const courseRound = { courseCode: 'AL0001'}

  createCsvFile('fileName').then(() => {
    t.ok(csvFile.writeLine.calledWith(['course_id', 'short_name', 'long_name', 'start_date', 'account_id', 'status'], 'fileName'))
    t.end()
  })
})