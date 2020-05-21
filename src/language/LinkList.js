/* eslint-disable strict */

class _Node {
  constructor(value, next = null) {
    (this.value = value), (this.next = next);
  }
}

class LinkedList {
  construtor(head) {
    this.head = head;
  }

  insertFirst(item) {
    this.head = new _Node(item);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;

      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  insertAt(nthPos, itemToInsert) {
    if (nthPos < 0) {
      throw Error("position error");
    }
    if (nthPos === 0) {
      this.insertFirst(itemToInsert);
    } else {
      // find the node we want to insert at
      const node = this._findNthElement(nthPos - 1);
      const newNode = new _Node(itemToInsert, null);
      newNode.next = node.next;
      node.next = newNode;
    }
  }

  _findNthElement(pos) {
    let node = this.head;
    for (let i = 0; i < pos; i++) {
      if (!node.next) {
        return node;
      } else {
        node = node.next;
      }
    }
    return node;
  }

  remove(item) {
    if (!this.head) {
      return null;
    }
    // if the node to be removed is the head, make the next node the head
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    // start at the head
    let currNode = this.head;
    let prevNode = this.head;
    while (currNode !== null && currNode.value !== item) {
      // save the prev node
      prevNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      throw Error("item not found");
    }
    prevNode.next = currNode.next;
  }

  find(item) {
    // check first if list is empty
    if (!this.head) {
      return null;
    }
    // start at head
    let currNode = this.head;
    while (currNode.value !== item) {
      // return null at end of the list and item not on the list
      if (currNode.next === null) {
        return null;
      } else {
        //keep looking
        currNode = currNode.next;
      }
    }
    // node found
    return currNode;
  }
}

module.exports = LinkedList;
