const {db} = require('../database.js')

const getAllStudentsQuery = `
    SELECT *
    FROM Students
`
function getAllStudents () {
    return db.raw(getAllStudentsQuery)
}

function getStudentsInCohort (cohortID) {
    return db.raw( `
        SELECT name, title 
        FROM Students 
        INNER JOIN Cohorts
        ON Students.cohortID = Cohorts.id
        WHERE cohortID = ?`, [cohortID]
)}
