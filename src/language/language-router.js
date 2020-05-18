const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

const languageRouter = express.Router();

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

languageRouter.post('/guess', async (req, res, next) => {
  try {
    const { guess } = req.body;

    if (!guess) {
      return res.status(400).json({
        error: 'no guess in request body',
      });
    }

    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );
    if (!words) {
      res.status(400).json({
        error: 'you do not have any words',
      });
    }
    const LangList = LanguageService();
  }
});

module.exports = languageRouter;
