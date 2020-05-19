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

  createWordsLinkList(language, words) {
    const wordsLinkList = new LinkList(
      language.user_id,
      language.id,
      language.total_score
    );
    let word = { next: language.head };
    while (word.next === null) {
      word = words.find((w) => w.id === word.next);
      wordsLinkList.insertLast({
        id: word.id,
        original: word.original,
        translation: word.translation,
        memory_value: word.memory_value,
        correct_count: word.correct_count,
        incorrect_count: word.incorrect_count,
      });
    }
    return wordsLinkList;
  },

  findWordsInList(language, words) {
    // const wordsLinkList = new LinkList(language.user_id, language.id);
    // let currWord = wordsLinkList.head.value;
    // let nextWord = wordsLinkList.head.next;
    // while (nextWord !== null) {
    //   for (let i = 0; i < words.length; i++) {
    //     if (words[i].id === nextId) {
    //       nextId = words[i].next;
    //       wordsLinkList.insertFirst(words[i]);
    //     }
    //   }
    // }
    // return wordsLinkList;
    const wordsLinkList = this.createWordsLinkList();

    do {
      let currNode = wordsLinkList.head.value;
      let nextNode = wordsLinkList.head.next;
      if (words === currNode) {
        currNode = nextNode;
        if (words !== nextNode) {
          throw new Error('linked list is empty!');
        } else {
          return wordsLinkList.find(words);
        }
      }
    } while (words !== wordsLinkList.head.value);
    return null;
  },

  updateWordsLinkList(db, nodes) {
    return db.transaction((trx) => {
      let listQueries = [];
      nodes.forEach((node) => {
        const query = db
          .from('word')
          .where('id', node.value.id)
          .update({
            memory_value: node.value.memory_value,
            correct_count: node.value.correct_count,
            incorrect_count: node.value.incorrect_count,
            next: node.next ? node.next.value.id : null,
          })
          .transacting(trx);
        listQueries.push(query);
      });
      return new Promise.resolve(listQueries)
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },

  updateListScore(db, wordsLinkList) {
    return db.from('language').where('user_id', wordsLinkList.user_id).update({
      head: wordsLinkList.head.value.id,
      total_score: wordsLinkList.total_score,
    });
  },

  updateListHeadWord(db, id, word) {
    return db('word').where({ id: id }).update(word);
  },
};

module.exports = LanguageService;
