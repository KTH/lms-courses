const csvFile = require('./csvFile')
const Promise = require('bluebird')
const {buildCanvasCourseObjects, flatten, deleteFile} =  require('./utils');

const columns = ['section_id', 'course_id', 'name', 'status']

module.exports = function (groupedCourses, fileName) {
  console.log('writing sections file: ', fileName, JSON.stringify(groupedCourses, null, 4))
  return deleteFile(fileName)
  .then(()=>csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName))
  .then(()=>buildCanvasCourseObjects(groupedCourses))
  .then(flatten)
  .then(arrayOfCourseRounds => Promise.map(
    arrayOfCourseRounds,
    round => csvFile.writeLine([round.sisCourseId, round.sisCourseId, `Section for the course ${round.longName}`, 'active'], fileName)))
  .then(()=>groupedCourses)
  .catch(e => console.error('An error occured',e))
}