module.exports = (word) => {
  // this returns true if all chars are either a lowercase letter or an underscore
  const regex = /^[a-z_]*$/;

  return regex.test(word);
};