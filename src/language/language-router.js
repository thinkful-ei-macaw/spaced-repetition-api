/* eslint-disable strict */
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
        error: "You don't have any languages",
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
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  let head;

  try {
    head = LanguageService.getListHead(req.app.get('db'), req.language.id);

    if (!head) {
      res.status(400).json({
        error: 'can not get your first word',
      });
    } else {
      res.status(200).json({
        nextWord: head.original,
        wordCorrectCount: head.correct_count,
        wordIncorrectCount: head.incorrect_count,
        totalScore: head.total_score,
      });
    }
  } catch (error) {
    next(error);
  }
});

languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  try {
    const { guess } = req.body;

    if (!guess) {
      return res.status(400).json({
        // eslint-disable-next-line quotes
        error: "Missing 'guess' in request body",
      });
    }
    const allWords = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    const wordsLinkList = await LanguageService.createWordsLinkList(
      req.language,
      allWords
    );

    const headWord = wordsLinkList.head;
    const answer = headWord.value.translation.toLowerCase();
    const userAnswer = guess.toLowerCase();
    let setCorrect;
    if (userAnswer === answer) {
      setCorrect = true;

      wordsLinkList.value.correct_count++;
      wordsLinkList.value.memory_value * 2;
      wordsLinkList.total_score.value++;
    } else {
      setCorrect = false;

      wordsLinkList.value.incorrect_count++;
      wordsLinkList.value.memory_value = 1;
      wordsLinkList.value.incorrect_count++;
    }

    wordsLinkList.shiftHead(wordsLinkList.head.value.memory_value);

    await LanguageService.updateWordsList(req.app.get('db'), wordsLinkList);

    return res.status(200).json({
      nextWord: wordsLinkList.head.value.original,
      wordCorrectCount: wordsLinkList.head.value.correct_count,
      wordIncorrectCount: wordsLinkList.head.value.incorrect_count,
      totalScore: wordsLinkList.total_score,
      answer,
      setCorrect,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
