const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const data = await LanguageService.getNextWord(
        req.app.get('db'),
        req.user.id)

        res.json({
        language: data.name,
        nextWord: data.original,
        wordCorrectCount: data.correct_count,
        wordIncorrectCount: data.incorrect_count,
        totalScore: data.total_score
      })
    } 
    catch(error) {
      next(error)
    }
  })

languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  try{
  const { guess } = req.body;
  let language = req.language
  if (!guess) {
    return res.status(400).json({
      error: `Missing 'guess' in request body`,
    });
  }

  const words = await LanguageService.getLanguageWords(
    req.app.get('db'),
    language.id
  );

  let headWord = await LanguageService.getHeadWord(
    req.app.get('db'),
    language.head
  )
  headWord = headWord[0]

  const list = LanguageService.createList(words, headWord)

  let isCorrect;

  if (headWord.translation === guess) {
    isCorrect = true
    language.total_score++

    headWord.memory_value *= 2
  }
  else {
    isCorrect = false
    headWord.incorrect_count++
    headWord.memory_value = 1
  }

console.log({headWord})
  list.remove(headWord)
  list.insertAt(headWord.memory_value, headWord)
  
  language.head = list.head.value.id 
  // LanguageService.displayList(list)
// console.log({language})
  await LanguageService.updateDb(
    req.app.get('db'),
    language,
    list
    )

    let nextWord = await LanguageService.getNextWord(
      req.app.get('db'),
      req.user.id
      )

      // console.log({nextWord})
    let rep = {
    nextWord: nextWord.original,
    totalScore: nextWord.total_score,
    wordCorrectCount: headWord.correct_count,
    wordIncorrectCount: headWord.incorrect_count,
    answer: headWord.translation,
    isCorrect
    }
  res.json(rep)

  }
  catch(error) {
    next(error)
  }

})

/* 


nextWord: testLanguagesWords[1].original,
            totalScore: 0,
            wordCorrectCount: 0,
            wordIncorrectCount: 0,
            answer: testLanguagesWords[0].translation,
            isCorrect: false
 */

module.exports = languageRouter;
