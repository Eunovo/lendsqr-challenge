module.exports.excludeFields = (obj, fieldsToExclude) => {
    return Object.keys(obj)
        .filter(key => !fieldsToExclude.includes(key))
        .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}
