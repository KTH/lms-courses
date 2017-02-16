const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const createSisCourseId = createCoursesFile.__get__('createSisCourseId')

// let sis_course_id = `${course_code}${_courseTerm(courseRoundObj)}${courseRoundObj.courseRound.$.roundId}`
test.only('should take a 2d array as input, and return a 1d array', t => {
  const result = createSisCourseId({
    courseCode: 'AL2140',
    startTerm: '20171',
    roundId: '1'
  })

  t.deepEqual(result, 'AL2140VT171')
  t.end()
})
