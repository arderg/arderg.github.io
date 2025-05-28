const fs = require('fs');
const path = require('path');

// Read the common words file
const commonWordsPath = path.join(__dirname, '..', 'data', 'common_words.txt');
const answersPath = path.join(__dirname, '..', 'data', 'answers.txt');

// Read and process the common words for answers
const commonWords = fs.readFileSync(commonWordsPath, 'utf8')
    .split('\n')
    .filter(word => word.length === 5) // Only keep 5-letter words
    .map(word => word.toLowerCase()) // Convert to lowercase
    .filter(word => /^[a-z]+$/.test(word)) // Only keep words with letters
    .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates

// Write the filtered common words to answers.txt
fs.writeFileSync(answersPath, commonWords.join('\n'));

console.log(`Generated ${commonWords.length} five-letter common words for answers`);
console.log('Note: words.txt was preserved unchanged'); 