const LinkedList = require("./LinkList");

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db.from("word").select("*").where({ language_id });
  },

  getNextWord(db, user_id) {
    return db
      .from("language")
      .select(
        "language.head",
        "word.correct_count",
        "word.incorrect_count",
        "language.total_score",
        "word.original",
        "word.translation"
      )
      .where("language.user_id", user_id)
      .first()
      .leftJoin("word", "language.head", "word.id");
  },

  getHeadWord(db, head_id) {
    return db.from("word").select("*").where("id", head_id);
  },

  createList(words, head) {
    let list = new LinkedList();
    list.insertFirst(head);

    let current = head;

    while (current.next) {
      let nextWord = words.find((word) => {
        return word.id == current.next;
      });
      // console.log({nextWord})
      list.insertLast(nextWord);

      current = nextWord;
    }
    return list;
  },

  updateDb(db, language, list) {
    return db.transaction(async (trx) => {
      try {
        let currNode = list.head;

        while (currNode) {
          let val = currNode.value;

          await trx("word").where("id", val.id).update({
            next: val.next,
            correct_count: val.correct_count,
            incorrect_count: val.incorrect_count,
            memory_value: val.memory_value,
          });

          currNode = currNode.next;
        }

        await trx("language").where("id", language.id).update({
          head: language.head,
          total_score: language.total_score,
        });

        await trx.commit();
      } catch (e) {
        await trx.rollback();
      }
    });
  },

  displayList(list) {
    let currNode = list.head;
    while (currNode !== null) {
      console.log(currNode.value);
      currNode = currNode.next;
    }
  },
};

module.exports = LanguageService;
