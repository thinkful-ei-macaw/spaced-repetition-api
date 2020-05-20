const {LinkedList, _Node} = require('./LinkList');

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
      .select('*')
      .where({ language_id });
  },

  getHeadWord(db, head_id) {
    return db
      .from('word')
      .select('*')
      .where('id', head_id)
  },

  createList(words, head) {
    head = head[0]

    let list = new LinkedList()
    list.insertFirst(head)

    let current = head

    while(current.next) {
      let nextWord = words.find(word => {
        return word.id == current.next })
        // console.log({nextWord})
      list.insertLast(nextWord)

      current = nextWord;
    }
    return list
  },



  updateDBwithList(db, language_id, list) {
    //update word values from list
  },
};

module.exports = LanguageService;
