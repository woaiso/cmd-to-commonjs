export default function (file: any, api: any) {
    const jscodeshift = api.jscodeshift;
    return jscodeshift(file.source)
        .find(jscodeshift.ExpressionStatement)
        .filter((path) => path.parentPath.node.type === 'Program' &&
            path.node.expression.type === 'CallExpression' &&
            path.node.expression.callee.type === 'Identifier' &&
            path.node.expression.callee.name === 'define')
        .replaceWith((path) => {
            const functionExpression = path.node.expression.arguments[ 0 ];
            const comments = path.node.comments;
            const result = [];
            if (comments && comments.length) {
                comments.forEach(comment => {
                    result.push(comment);
                })

            }
            console.log(result);
            const leading = [];
            let isLeading = true;
            functionExpression.body.body.forEach((item) => {
                if (isLeading &&
                    item.type === 'ExpressionStatement' &&
                    item.expression.type === 'Literal') {
                    leading.push(item);
                } else if (item.type === 'ReturnStatement') {
                    const returnStatement = jscodeshift(item)
                        .toSource()
                        .replace('return ', 'module.exports = ');
                    isLeading = false;
                    result.push(returnStatement);
                } else {
                    isLeading = false;
                    result.push(item);
                }
            });
            return leading.concat(result);
        })
        .toSource();
}