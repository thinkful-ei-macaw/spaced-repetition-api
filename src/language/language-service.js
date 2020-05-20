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

  getWord(db, id) {
    if (!id) {
      return;
    }
    return db.from('word').select('*').where({ id }).first();
  },

  getNextWord(db, id) {
    if (!id) {
      return;
    }
    return db
      .from('word')
      .select('original', 'correct_count', 'incorrect_count')
      .where({ id })
      .first();
  },

  async createWordsLinkList(db, head) {
    let currWord;
    try {
      currWord = await this.getWord(db, head);
      console.log(currWord);
    } catch (error) {
      throw new Error('could not find the first word');
    }
    const wordsLinkList = new LinkList();
    let wordId = currWord.id;
    while (id) {
      wordId = word.next;
      wordsLinkList.insertAfter(currWord);
      let nextWord;
      try {
        currWord = await this.getNextWord(db, id);
      } catch (error) {
        throw new Error('could not find the next word');
      }
      return wordsLinkList;
    }
  },

  updateWordsList(db, wordsLinkList, user_id) {
    return db.transaction(async (trx) => {
      let currWord = wordsLinkList.head;
      await trx
      .into('language')
      .where({ user_id })
      .update({ head: currWord.value.id });

      while(currWord !== null) {
        await trx
        .into('word')
        .where({ id: currWord.value.id })
        .update({
          next: currWord.next !== null ? currWord.next.value.id : null,
        });
        currWord = currWord.next;
      }
    })
  }

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

  updateTotalScore(db, user_id, total_score) {
    return db
      .from('language')
      .increment({ total_score })
      .where({ user_id })
      .returning('total_score');
  },
};

module.exports = LanguageService;
