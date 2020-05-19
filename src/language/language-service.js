/* eslint-disable strict */
const LinkedList = require('./LinkedList');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getWord(db, id) {
    return db.from('word').select('*').where('id', id);
  },

  getNextWord(db, user_id) {
    return db
      .from('language')
      .select(
        'language.head',
        'word.correct_count',
        'word.incorrect_count',
        'language.total_score',
        'word.original'
      )
      .where('language.user_id', user_id)
      .first()
      .leftJoin('word', 'language.head', 'word.id');
  },

  getLanguageHeadWord(db, language_id) {
    return db
      .from('language')
      .select(
        'word.original',
        'word.translation',
        'word.correct_count',
        'word.incorrect_count',
        'language.total_score',
        'word.next'
      )
      .join('word', 'word.id', '=', 'language.head')
      .where('language.id', language_id);
  },

  createWordsLinkedList: async (db, words) => {
    const wordsLinkedList = new LinkedList();

    words.forEach(word => {
      wordsLinkedList.insertLast(word)
    });
    // const firstWord = await LanguageService.getWord(db, head);

    // wordsLinkedList.insertFirst(firstWord);

    // let nextWord = await LanguageService.getWord(db, firstWord.next);

    // while (nextWord) {
    //   wordsLinkedList.insertLast(nextWord);
    //   nextWord = await LanguageService.getNextWord(db, user_id);
    // }

    return wordsLinkedList;
  },

  correctWord(db, memory_value, id) {
    return db
      .from('word')
      .where('id', id)
      .increment('correct_count', 1)
      .increment('memory_value', memory_value)
      .returning(
        'translation',
        'memory_value',
        'correct_count',
        'incorrect_count',
        'memory_value'
      );
  },

  incorrectWord(db, word_id) {
    return db
      .from('word')
      .where('id', word_id)
      .update('memory_value', 1)
      .increment('incorrect_count', 1)
      .returning('next', 'translation', 'memory_value', 'incorrect_count');
  },

  getTotalScore(db, language_id) {
    return db.from('word').where('id', word_id).update('next', next_id);
  },

  updateTotalScore(db, language_id) {
    return db
      .from('language')
      .where('id', language_id)
      .increment('total_score', 1)
      .returning('total_score');
  },

  nextHead(db, language_id, next) {
    return db.from('language').where('id', language_id).update('head', next);
  },

  switchNexts(db, word_id, next_id) {
    return db.from('word').where('id', word_id).update('next', next_id);
  },

  shiftWords: async (db, language_id, memory_value, word_id, linkList) => {
    let lastNode = linkList.head;

    let words = await LanguageService.getLanguageWords(db, language_id);
    let nextNode = await LanguageService.nextHead(
      db,
      language_id,
      lastNode.value.next
    );
    if (memory_value > words.length - 1) {
      while (lastNode.next) {
        lastNode = lastNode.next;
      }
      await LanguageService.switchNexts(db, lastNode.value.id, word_id);
      await LanguageService.switchNexts(db, word_id, null);
      return;
    }

    for (let i = 0; i <= memory_value; i++) {
      lastNode = lastNode.next;
    }
    let nextId = lastNode.next.value.id;
    await LanguageService.switchNexts(db, lastNode.value.id, word_id);
    await LanguageService.switchNexts(db, word_id, nextId);
    return;
  },
};

module.exports = LanguageService;
