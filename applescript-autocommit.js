const fs = require('fs-extra');
const { exec } = require('child_process');

const chronologicalFileContents = fs.readFileSync('./chronological.txt', 'utf-8');
const allWords = chronologicalFileContents.split('\n');

const emailBody = process.env.EMAIL_BODY.split('|').join("\n");

const emailMetaDataArray = process.env.EMAIL_SUBJECT.split(' ');
const wordleDay = emailMetaDataArray[1];
const wordleWord = emailMetaDataArray[3][0].toUpperCase() + emailMetaDataArray[3].substring(1);

if (allWords.includes(wordleWord)) {
    console.warn('We already have this word');
}
else {
    console.log('About to enter the word ', wordleWord);
    allWords.push(wordleWord);
    fs.writeFileSync('./chronological.txt', allWords.join('\n'), "utf8");
    const statsOutput = require('./stats.js');
    const filesToCommit = ['statistics.csv', 'racingchart.csv', 'chronological.txt', 'alphabetical.txt'];
    exec(`git add ${filesToCommit.join(' ')}`, (err, stdout, stderr) => {
        exec(`git commit -m "CHG: ${process.env.EMAIL_SUBJECT}" -m "${emailBody}"`, (err, stdout, stderr) => {
            // handle err, stdout & stderr
        });
    });
}

console.log('wordleDay', wordleDay);
console.log('wordleWord', wordleWord);
console.log('EMAIL_BODY', emailBody);