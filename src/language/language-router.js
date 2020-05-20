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
  try {
    const head = await LanguageService.getNextWord(
      req.app.get('db'),
      req.language.id
    );
    console.log('yo');
    res.json({
      language: language.head,
      nextWord: head.original,
      wordCorrectCount: head.correct_count,
      wordIncorrectCount: head.incorrect_count,
      totalScore: language.total_score,
    });
  } catch (error) {
    next(error);
  }
});

languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  const { guess } = req.body;
  let headWordId = req.language.head;
  console.log(headWordId, req.language.id);
  if (!guess) {
    return res.status(400).json({
      // eslint-disable-next-line quotes
      error: "Missing 'guess' in request body",
    });
  }
  let headWord;
  try {
    headWord = await LanguageService.getWord(req.app.get('db'), headWordId);
    console.log(headWord);
  } catch (error) {
    return next(error);
  }

  const userAnswer = guess.toLowerCase();
  let isCorrect = false;

  if (userAnswer === headWord.translation) {
    try {
      let countCorrect = headWord.correct_count;
      let countIncorrect = headWord.correct_count;
      let memoryBonus = headWord.memory_value * 2;
      let countTotal = req.language.total_score;
      isCorrect = true;

      // const correctWord = await LanguageService.correctWord(
      //   req.app.get('db'),
      //   memory_value ,
      //   id
      // );
      await LanguageService.updateWord(req.app.get('db'), headWord.id, {
        memory_value: memoryBonus,
        correct_count: countCorrect++,
        headWord,
      });

      await LanguageService.updateTotalScore(
        req.app.get('db'),
        req.user.id,
        countTotal++
      );

      let wordsLinkList = await LanguageService.createWordsLinkList(
        req.app.get('db'),
        headWordId
      );

      await LanguageService.getNextWord(
        req.app.get('db'),
        wordsLinkList.head.value.next
      );

      if (userAnswer !== headWord.translation) {
        memoryBonus = 1;

        await LanguageService.updateWord(req.app.get('db'), headWord.id, {
          memory_value: memoryBonus,
          incorrect_count: countIncorrect++,
          ...headWord,
        });
        // const incorrectResponse = {
        //   nextWord: wordsLinkList.head.next.value.original,
        //   wordCorrectCount: nextWord.correct_count,
        //   wordIncorrectCount: wordsLinkList.head.next.value.incorrect_count,
        //   totalScore: countTotal,
        //   isCorrect: false,
        // };
        // res.send(incorrectResponse);
        // next();
      }

      await LanguageService.updateWordsList(
        req.app.get('db'),
        wordsLinkList,
        req.user.id
      );

      const nextWord = wordsLinkList.head.value;

      return res.status(200).json({
        answer: nextWord.translation,
        isCorrect: isCorrect,
        nextWord: nextWord.original,
        totalScore: countTotal,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: nextWord.incorrect_count,
      });
    } catch (error) {
      next(error);
    }
  }
});

module.exports = languageRouter;
