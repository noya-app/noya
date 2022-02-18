// Copied from svgkit
export class JSEmbindObject {
  _isDeleted = false;

  clone() {
    return this;
  }
  delete() {
    this._isDeleted = false;
  }
  deleteAfter() {
    console.warn(`JSEmbindObject.deleteAfter not implemented!`);
  }
  isAliasOf(other: any) {
    return this === other;
  }
  isDeleted() {
    return this._isDeleted;
  }
}
