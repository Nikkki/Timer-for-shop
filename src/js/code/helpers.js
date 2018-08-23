exports.difference = (arr, exclude) => {
    return arr.filter(function (i) { return exclude.indexOf(i) < 0; });
}