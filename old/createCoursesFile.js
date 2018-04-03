require('dotenv').config()
let koppsBaseUrl
const rp = require('request-promise')
const Promise = require('bluebird') // use bluebird to get a little more promise functions then the standard Promise AP
const {
  buildCanvasCourseObjectV2,
  deleteFile
} = require('./utils')
const createSectionsFile = require('./createSectionsFile')
const csvFile = require('./csvFile')
const {mkdir} = require('fs')
const logger = require('../server/logger')

let mkdirAsync = Promise.promisify(mkdir)


async function createCsvFile (fileName) {
  const columns = [
    'course_id',
    'short_name',
    'long_name',
    'start_date',
    'account_id',
    'status']

  return await csvFile.writeLine(columns, fileName)
}
//TODO TA BORT PERIODS
function filterCourseOfferings(res, year, term, period) {
  return res
    .filter(courseOffering => courseOffering.state === 'Godkänt' || courseOffering.state === 'Fullsatt')
    //.filter(courseOffering => courseOffering.first_period === `${year}${term}P${period}`)
}

function createCourseOfferingObj(courseOffering) {
  return {
    courseCode: courseOffering.course_code,
    startTerm: courseOffering.first_yearsemester,
    roundId: courseOffering.offering_id,
    startSemester: courseOffering.offered_semesters.filter(s => s.semester === courseOffering.first_yearsemester)[0], //take start_Week for whole course
    shortName: courseOffering.short_name,
    tutoringLanguage: courseOffering.language,
    title: {
      sv: courseOffering.course_name,
      en: courseOffering.course_name_en
    }   
  }
}

module.exports = {
  set koppsBaseUrl(url){
    koppsBaseUrl = url
  },
  async createCoursesFile ({term, year, period, csvDir = 'csv'}) {
    const termin = `${year}${term}`
    const fileName = `${csvDir}courses-${termin}-${period}.csv`
    const enrollmentsFileName = `${csvDir}sections-${termin}-${period}.csv`
    logger.info('Using file name:', fileName)
    await deleteFile(fileName)
    await createCsvFile(fileName)
    logger.info('Calling kopps...')
    
    const res = await rp({
      url: `${koppsBaseUrl}v2/courses/offerings?from=${termin}`,
      method: 'GET',
      json: true,
      headers: {'content-type':'application/json'}
    })

    logger.info('got response from kopps')
    
    const courseOfferings = await filterCourseOfferings(res, year, term, period)

    const canvasFormattedCourses = []

    for (const courseOffering of courseOfferings) {
      const courseRound = await createCourseOfferingObj(courseOffering)
      
      const course = await buildCanvasCourseObjectV2(courseRound)
      canvasFormattedCourses.push(course)

      await csvFile.writeLine([
        course.sisCourseId,
        course.courseCode,
        course.longName,
        course.startDate,
        course.sisAccountId,
        'active'], fileName)
    }   
    
    //START SECTIONS FILE
    await createSectionsFile(canvasFormattedCourses, enrollmentsFileName)

    return [fileName, enrollmentsFileName]
  
  }}
