const fs = require('fs-extra');

const words = fs.readFileSync('./chronological.txt', 'utf-8').split('\n');
const allValidAnswers = fs.readFileSync('./all_valid_answers_statistics.csv', 'utf-8').split('\n');
const lettersOfTheAlphabet = 'abcdefghijklmnopqrstuvwxyz';
const lettersOfTheAlphabetArray = lettersOfTheAlphabet.split('');
const lettersUsedObject = {};
const allValidAnswersObject = {};
const chronologicalLeaderboard = {
    0: {}
};

allValidAnswers.filter((letter, i) => i > 0).forEach(letter => {
    const letterStats = letter.split(',');
    allValidAnswersObject[letterStats[0]] = {
        percentageOfAllLetters: letterStats[3],
        percentageOfAllWords: letterStats[4]
    }
});

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
        asSecondLetter: 0,
        asThirdLetter: 0,
        asFourthLetter: 0,
        asLastLetter: 0,
        percentageTimesInAllValidAnswersLettersFuturePastAndPresent: allValidAnswersObject[letter].percentageOfAllLetters,
        percentageTimesInAllValidAnswersWordsFuturePastAndPresent: allValidAnswersObject[letter].percentageOfAllWords
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
        if (il === 1) lettersUsedObject[letterLowercase].asSecondLetter++;
        if (il === 2) lettersUsedObject[letterLowercase].asThirdLetter++;
        if (il === 3) lettersUsedObject[letterLowercase].asFourthLetter++;
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

const daysSoFar = Object.keys(chronologicalLeaderboard).length - 1;
const letterFrequency = Object.values(lettersUsedObject).sort((a, b) => b.count - a.count);
const fileData = 'letter,count,days used,percentage of total letters used to date,percentage of total letters used for all possible answers,difference in letters used,percentage of total days used to date,percentage of days used in all possible days,difference in words used,longest streak,current streak,most in one word,days since last appearance,times as first letter,times as second letter,times as third letter,times as fourth letter,times as last letter\n' + letterFrequency.reduce((returnValue, data) => {
    const percentLetters = ((data.count / (daysSoFar * 5)) * 100).toFixed(2);
    const percentWords = ((data.daysUsed / daysSoFar) * 100).toFixed(2);
    return returnValue + `${data.letter},${data.count},${data.daysUsed},${percentLetters},${data.percentageTimesInAllValidAnswersLettersFuturePastAndPresent},${(percentLetters-data.percentageTimesInAllValidAnswersLettersFuturePastAndPresent).toFixed(2)},${percentWords},${data.percentageTimesInAllValidAnswersWordsFuturePastAndPresent},${(percentWords-data.percentageTimesInAllValidAnswersWordsFuturePastAndPresent).toFixed(2)},${data.longestStreak},${data.currentStreak},${data.mostInOneWord},${data.daysSince},${data.asFirstLetter},${data.asSecondLetter},${data.asThirdLetter},${data.asFourthLetter},${data.asLastLetter}\n`;
}, '');
fs.writeFileSync('./statistics.csv', fileData, "utf8");

let racingBarChartFileData = `name,,,Day -1,${Array.from({ length:  daysSoFar}, (v, i) => 'Day ' + i).join(',')}\n`;

lettersOfTheAlphabetArray.forEach(letter => {
    racingBarChartFileData += `${letter},,,` + Object.keys(chronologicalLeaderboard).reduce((returnValue, data) => {
        return returnValue + `${chronologicalLeaderboard[data][letter]},`
    }, '').slice(0, -1) + '\n';
});
fs.writeFileSync('./racingchart.csv', racingBarChartFileData, "utf8");

fs.writeFileSync('./alphabetical.txt', words.sort().join('\n'), "utf8");
