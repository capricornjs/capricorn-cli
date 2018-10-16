const exec = require('child_process').execSync

module.exports = function () {
    let author, email
    try {
        author = exec('git config --get user.name')
        email = exec('git config --get user.email')
    } catch (e) {}
    author = author && author.toString().trim()
    email = email && (email.toString().trim())
    return {
        author: author || '',
        email: email || ''
    }
}
