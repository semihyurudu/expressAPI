module.exports = {
  checkObjectId: (id) => {
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    return checkForHexRegExp.test(id)
  }
}