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

languageRouter.get('/head', async (req, res, next) => {
  try {
    const head = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );
    console.log({ head });
    res.json({
      language: head.name,
      nextWord: head.original,
      wordCorrectCount: head.correct_count,
      wordIncorrectCount: head.incorrect_count,
      totalScore: head.total_score,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  const { guess } = req.body;
  if (!guess) {
    return res.status(400).json({
      error: `No 'Guess' value in req body! Please enter a guess and try again...`,
    });
  }

  const words = await LanguageService.getLanguageWords(
    req.app.get('db'),
    req.language.id
  );

  const headWord = await LanguageService.getHeadWord(
    req.app.get('db'),
    req.language.head
  )

  const list = LanguageService.createList(words, headWord)

  let wasUserCorrect;

  if (headWord[0].translation === guess) {
    wasUserCorrect = true
  }
  else {
    wasUserCorrect = false
  }

  LanguageService.updateDBwithList(
    req.app.get('db'),
    req.language,
    wasUserCorrect,
    list
    )



  res.json(words)


})



/* 

If the answer was correct:
Double the value of M
Else, if the answer was wrong:
Reset M to 1
Move the question back M places in the list


Set the word's new memory value as appropriate according to the algorithm.
Update the incorrect count or correct count for that word.
Update the total score if appropriate.
Shift the word along the linked list the appropriate amount of spaces.
Persist the updated words and language in the database. */

module.exports = languageRouter;
