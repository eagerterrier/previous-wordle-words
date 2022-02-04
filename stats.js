const fs = require('fs-extra');

const words = fs.readFileSync('./chronological.txt', 'utf-8').split('\n');
const lettersOfTheAlphabet = 'abcdefghijklmnopqrstuvwxyz';
const lettersOfTheAlphabetArray = lettersOfTheAlphabet.split('');
const lettersUsedObject = {};

lettersOfTheAlphabetArray.forEach(letter => {
    lettersUsedObject[letter] = {
        letter,
        count: 0,
        longestStreak: 1,
        currentStreak: 0,
        daysUsed: 0,
        daysSince: 0,
        mostInOneWord: 0
    }
});

let todaysLetters = [];
let previousDaysLetters = [];
words.forEach((word) => {
    const letters = word.split('');
    let mostInOneWord = [];
    letters.forEach(letter => {
        const letterLowercase = letter.toLowerCase();
        lettersUsedObject[letterLowercase].count++;
        if (todaysLetters.indexOf(letterLowercase) === -1) todaysLetters.push(letterLowercase);
        mostInOneWord[letterLowercase] ? mostInOneWord[letterLowercase]++ : mostInOneWord[letterLowercase] = 1;
        if (mostInOneWord[letterLowercase] > lettersUsedObject[letterLowercase].mostInOneWord) lettersUsedObject[letterLowercase].mostInOneWord = mostInOneWord[letterLowercase];
    });
    
    const todayAndYesterday = [...new Set([...todaysLetters, ...previousDaysLetters])];

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
    previousDaysLetters = todaysLetters;
    mostInOneWord = [];
    todaysLetters = [];
});

const letterFrequency = Object.values(lettersUsedObject).sort((a, b) => b.count - a.count);
const fileData = 'letter,count,days used,longest streak,current streak,most in one word,days since last appearance\n' + letterFrequency.reduce((returnValue, data) => {
    return returnValue + `${data.letter},${data.count},${data.daysUsed},${data.longestStreak},${data.currentStreak},${data.mostInOneWord},${data.daysSince}\n`;
}, '');
fs.writeFileSync('./statistics.csv', fileData, "utf8");

