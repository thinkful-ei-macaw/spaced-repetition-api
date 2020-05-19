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
    const { head } = await LanguageService.getLanguageHeadWord(
      req.app.get('db'),
      req.language.id
    );
    console.log({ head });
    res.json({
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

  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    if (!words) {
      res.status(400).json({
        error: 'No words found for this language!',
      });
    }

    const wordsLinkList = await LanguageService.createWordsLinkList(
      req.app.get('db'),
      words
    );

    let { translation, memory_value, id } = wordsLinkList.head.value;
    const userAnswer = guess.toLowerCase();

    if (userAnswer === translation.toLowerCase()) {
      try {
        let correctWord = await LanguageService.correctWord(
          req.app.get('db'),
          memory_value,
          id
        );
        let nextWord = await LanguageService.getNextWord(
          req.app.get('db'),
          wordsLinkList.head.value.next
        );
        let total = await LanguageService.updateTotalScore(
          req.app.get('db'),
          req.language.id
        );
        await LanguageService.shiftWords(
          req.app.get('db'),
          req.language.id,
          memory_value,
          wordsLinkList,
          id
        );

        let correctResponse = {
          nextWord: wordsLinkList.head.next.value.original,
          wordCorrectCount: nextWord.correct_count,
          wordIncorrectCount: nextWord.incorrect_count,
          totalScore: total,
          answer: correctWord.translation,
          isCorrect: true,
        };

        res.send(correctResponse);
        next();
      } catch (error) {
        next(error);
      }
    } else {
      try {
        let incorrectWord = await LanguageService.incorrectWord(
          req.app.get('db'),
          id
        );
        let nextWord = await LanguageService.getNextWord(
          req.app.get('db'),
          wordsLinkList.head.value.next
        );

        await LanguageService.shiftWords(
          req.app.get('db'),
          req.language.id,
          wordsLinkList,
          id,
          0
        );

        let total = await LanguageService.getTotalScore(
          req.app.get('db'),
          req.language.id
        );

        const incorrectResponse = {
          nextWord: wordsLinkList.head.next.value.original,
          wordCorrectCount: nextWord.correct_count,
          wordIncorrectCount: wordsLinkList.head.next.value.incorrect_count,
          totalScore: total,
          isCorrect: false,
        };

        res.send(incorrectResponse);
      } finally {
        next();
      }
    }
  } finally {
    next();
  }
});

module.exports = languageRouter;
