/* eslint-disable strict */
const LinkList = require('./LinkList');

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
  getLangLinkList(words, headId) {
    const langLinkList = new LinkList();
    let nextId = headId;
    while (nextId !== null) {
      for (let i = 0; i < words.length; i++) {
        if (words[i].id === nextId) {
          nextId = words[i].next;
          langLinkList.insertFirst(words[i]);
        }
      }
    }
    return langLinkList;
  },
};

module.exports = LanguageService;
