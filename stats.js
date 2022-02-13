const fs = require('fs-extra');

const words = fs.readFileSync('./chronological.txt', 'utf-8').split('\n');
const lettersOfTheAlphabet = 'abcdefghijklmnopqrstuvwxyz';
const lettersOfTheAlphabetArray = lettersOfTheAlphabet.split('');
const lettersUsedObject = {};
const chronologicalLeaderboard = {
    0: {}
};

lettersOfTheAlphabetArray.forEach(letter => {
    lettersUsedObject[letter] = {
        letter,
        count: 0,
        longestStreak: 1,
        currentStreak: 0,
        daysUsed: 0,
        daysSince: 0,
        mostInOneWord: 0,
        asFirstLetter: 0,
        asLastLetter: 0
    }
    chronologicalLeaderboard[0][letter] = 0;
});

let todaysLetters = [];
words.forEach((word, i) => {
    const currentDay = i + 1;
    chronologicalLeaderboard[currentDay] = { ...chronologicalLeaderboard[i] };
    const letters = word.split('');
    let mostInOneWord = [];
    letters.forEach((letter, il) => {
        const letterLowercase = letter.toLowerCase();
        lettersUsedObject[letterLowercase].count++;
        if (il === 0) lettersUsedObject[letterLowercase].asFirstLetter++;
        if (il === 4) lettersUsedObject[letterLowercase].asLastLetter++;
        chronologicalLeaderboard[currentDay][letterLowercase]++;
        if (todaysLetters.indexOf(letterLowercase) === -1) todaysLetters.push(letterLowercase);
        mostInOneWord[letterLowercase] ? mostInOneWord[letterLowercase]++ : mostInOneWord[letterLowercase] = 1;
        if (mostInOneWord[letterLowercase] > lettersUsedObject[letterLowercase].mostInOneWord) lettersUsedObject[letterLowercase].mostInOneWord = mostInOneWord[letterLowercase];
    });

    todaysLetters.forEach(letter => {
        lettersUsedObject[letter].daysUsed++;
        lettersUsedObject[letter].currentStreak++;
        if (lettersUsedObject[letter].currentStreak > lettersUsedObject[letter].longestStreak) {
            lettersUsedObject[letter].longestStreak = lettersUsedObject[letter].currentStreak;
        }
    });
    lettersOfTheAlphabetArray.forEach(letter => {
        if (todaysLetters.indexOf(letter) === -1) {
            lettersUsedObject[letter].currentStreak = 0;
            lettersUsedObject[letter].daysSince++;
        }
        else {
            lettersUsedObject[letter].daysSince = 0;
        }
    });
    mostInOneWord = [];
    todaysLetters = [];
});

const letterFrequency = Object.values(lettersUsedObject).sort((a, b) => b.count - a.count);
const fileData = 'letter,count,days used,longest streak,current streak,most in one word,days since last appearance,times as first letter,times as last letter\n' + letterFrequency.reduce((returnValue, data) => {
    return returnValue + `${data.letter},${data.count},${data.daysUsed},${data.longestStreak},${data.currentStreak},${data.mostInOneWord},${data.daysSince},${data.asFirstLetter},${data.asLastLetter}\n`;
}, '');
fs.writeFileSync('./statistics.csv', fileData, "utf8");

let racingBarChartFileData = `name,,,Day -1,${Array.from({ length: Object.keys(chronologicalLeaderboard).length - 1 }, (v, i) => 'Day ' + i).join(',')}\n`;

lettersOfTheAlphabetArray.forEach(letter => {
    racingBarChartFileData += `${letter},,,` + Object.keys(chronologicalLeaderboard).reduce((returnValue, data) => {
        return returnValue + `${chronologicalLeaderboard[data][letter]},`
    }, '').slice(0, -1) + '\n';
});
fs.writeFileSync('./racingchart.csv', racingBarChartFileData, "utf8");

fs.writeFileSync('./alphabetical.txt', words.sort().join('\n'), "utf8");
