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
    const data = await LanguageService.getNextWord(
      req.app.get('db'),
      req.user.id
    );
    console.log({ data });
    res.json({
      nextWord: data.original,
      wordCorrectCount: data.correct_count,
      wordIncorrectCount: data.incorrect_count,
      totalScore: data.total_score,
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
      req.language,
      words
    );

    let currentWord = wordsLinkList.find(wordsLinkList.head.value);
    let nextWord = wordsLinkList.head.next;

    const response = {
      word: wordsLinkList.word.original,
      correct: wordsLinkList.word.correct_count,
      incorrect: req.word.incorrect_count,
      total: wordsLinkList.language.total_score,
      memoryBonus: wordsLinkList.head.value.memory_value,
      solution: wordsLinkList.head.value.translation.toLowerCase(),
      setResult: null,
    };

    // toLowerCase() - users submission can be compared to the translated solution accurately
    const userAnswer = guess.toLowerCase();

    if (userAnswer === response.solution) {
      response.setResult = true;
      response.correct++;
      response.total++;
      response.memoryBonus *= 2;
      res.status(201);
    } else if (userAnswer !== solution) {
      response.setResult = false;
      response.incorrect++;
      total--;
      response.memoryBonus = 1;
    } else {
      throw new Error('Solution word not found! Unable to proceed.');
    }

    const arrangeWords = await wordsLinkList.insertAt(
      wordsLinkList.head.value.memory_value
    );

    await LanguageService.updateWordsLinkList(req.app.get('db'), arrangeWords);
    await LanguageService.updateListScore(req.app.get('db'));
    await LanguageService.updateListHead(
      req.app.get('db'),
      req.language.id,
      wordsLinkList.head.id
    );

    return res.status(200).json({
      nextWord: wordsLinkList.head.value.original,
      wordsCorrect: wordsLinkList.head.value.correct_count,
      wordsIncorrect: wordsLinkList.head.value.incorrect_count,
      totalScore: wordsLinkList.total_score,
      usersAnswer,
      actualAnswer,
    });
  } catch (error) {
    next(error);
  } finally {
    res.send(reqBody);
  }
});

module.exports = languageRouter;
