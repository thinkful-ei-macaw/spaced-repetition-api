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
      next()
    } 
    catch(error) {
      next(error)
    }
  })


languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  const { guess } = req.body;
  console.log('BODY', req.body)
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
    console.log('step1', {words})

    if (!words) {
      res.status(400).json({
        error: 'No words found for this language!',
      });
    }

    const wordsLinkList = await LanguageService.createWordsLinkList(
      req.app.get('db'),
      words
    );
      console.log({wordsLinkList})
    let { translation, memory_value, id } = wordsLinkList.head.value;
    const userAnswer = guess.toLowerCase();
      console.log('step2', {translation, memory_value, id})
    if (userAnswer === translation.toLowerCase()) {
      try {
        let correctWord = await LanguageService.correctWord(
          req.app.get('db'),
          memory_value,
          id
        );
        console.log('step3', {correctWord})
        let nextWord = await LanguageService.getNextWord(
          req.app.get('db'),
          wordsLinkList.head.value.next
        );
        console.log('step4', {nextWord})
        let total = await LanguageService.updateTotalScore(
          req.app.get('db'),
          req.language.id
        );
        console.log('step5', {total})
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
        console.log('step6', {correctResponse})

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
        console.log('step7', {incorrectWord})
        let nextWord = await LanguageService.getNextWord(
          req.app.get('db'),
          wordsLinkList.head.value.next
        );
        console.log('step8', {nextWord})
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
          console.log('step9', {total})
        let incorrectResponse = {
          nextWord: wordsLinkList.head.next.value.original,
          wordCorrectCount: nextWord.correct_count,
          wordIncorrectCount: wordsLinkList.head.next.value.incorrect_count,
          totalScore: total,
          isCorrect: false,
        };
        console.log('step10', {incorrectResponse})
        res.send(incorrectResponse);
      } catch(error) {
        next();
      } 
    } 
  }
  catch(error) {
    next();
  } 
})

module.exports = languageRouter;
